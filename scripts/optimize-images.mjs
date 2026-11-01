import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { parseHTML } from 'linkedom';

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

function profile(img) {
  if (img.classList.contains('avatar')) {
    const size = img.classList.contains('avatar-lg') ? 72 : Number(img.getAttribute('width')) || 48;
    return { widths: [size, size * 2], fallback: size * 2, sizes: `${size}px` };
  }
  if (img.closest('.about-page')) return { widths: [320, 480, 525, 800, 1050], fallback: 525, sizes: '(max-width: 380px) calc(100vw - 24px), (max-width: 561px) calc(100vw - 36px), 525px' };
  if (img.closest('.opening-cover')) return { widths: [200, 330, 400, 660, 750], fallback: 400, sizes: '(max-width: 760px) 190px, 330px' };
  if (img.closest('.cover-frame')) return { widths: [160, 240, 360, 480, 750], fallback: 360, sizes: '(max-width: 760px) calc((100vw - 52px) / 2), 300px' };
  if (img.closest('.card-media')) return { widths: [320, 480, 750], fallback: 480, sizes: '(max-width: 760px) calc(100vw - 36px), (max-width: 980px) 65vw, 480px' };
  if (img.closest('.article-row-media')) return { widths: [160, 240, 480], fallback: 240, sizes: '240px' };
  if (img.closest('.recent-cover')) return { widths: [320, 480, 750], fallback: 480, sizes: '(max-width: 760px) 90vw, 560px' };
  if (img.closest('.issue-cover')) return { widths: [320, 480, 750], fallback: 480, sizes: '(max-width: 760px) 80vw, 360px' };
  return { widths: [480, 800, 1200], fallback: 800, sizes: '(max-width: 760px) 90vw, 680px' };
}

export async function optimizeImages(directory, { base = '/' } = {}) {
  const root = resolve(directory);
  const prefix = base.replace(/\/$/, '');
  const assets = resolve(root, '_astro');
  await mkdir(assets, { recursive: true });
  const sources = new Map();
  const variants = new Map();
  let pages = 0;
  for (const path of await htmlFiles(root)) {
    const { document } = parseHTML(await readFile(path, 'utf8'));
    let changed = false;
    for (const img of document.querySelectorAll('img')) {
      // Leave authored or already optimized picture elements intact.
      if (img.closest('picture')) continue;
      const src = img.getAttribute('src') || '';
      if (!src.startsWith(`${prefix}/`)) continue;
      const local = src.slice(prefix.length);
      if (!/^\/(?:images|covers)\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|avif)$/.test(local)) continue;
      const sourcePath = resolve(root, `.${local}`);
      if (!sourcePath.startsWith(root + sep)) throw new Error(`Image escapes output directory: ${src}`);
      let source = sources.get(sourcePath);
      if (!source) {
        const buffer = await readFile(sourcePath);
        const metadata = await sharp(buffer).metadata();
        if ((metadata.pages || 1) > 1) continue;
        const rotated = [5, 6, 7, 8].includes(metadata.orientation);
        source = { buffer, width: rotated ? metadata.height : metadata.width, height: rotated ? metadata.width : metadata.height };
        if (!source.width || !source.height) throw new Error(`Missing image dimensions: ${src}`);
        sources.set(sourcePath, source);
      }
      const settings = profile(img);
      const widths = [...new Set(settings.widths.map(width => Math.min(width, source.width)))].sort((a, b) => a - b);
      const choices = [];
      for (const width of widths) {
        const key = `${sourcePath}:${width}`;
        let variant = variants.get(key);
        if (!variant) {
          const buffer = await sharp(source.buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
          const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 20);
          const name = `image-${hash}-${width}.webp`;
          await writeFile(resolve(assets, name), buffer);
          variant = { url: `${prefix}/_astro/${name}`, width };
          variants.set(key, variant);
        }
        choices.push(variant);
      }
      const fallback = choices.find(choice => choice.width >= Math.min(settings.fallback, source.width)) || choices.at(-1);
      // Every image has a format fallback, including original WebP magazine covers.
      if (!/\.(?:png|jpe?g)$/i.test(local)) {
        const key = sourcePath + ':' + fallback.width + ':png';
        let compatible = variants.get(key);
        if (!compatible) {
          const buffer = await sharp(source.buffer).rotate().resize({ width: fallback.width, withoutEnlargement: true }).png().toBuffer();
          const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 20);
          const name = 'image-' + hash + '-' + fallback.width + '.png';
          await writeFile(resolve(assets, name), buffer);
          compatible = { url: prefix + '/_astro/' + name, width: fallback.width };
          variants.set(key, compatible);
        }
        img.setAttribute('src', compatible.url);
      }
      const responsive = document.createElement('source');
      const picture = document.createElement('picture');
      responsive.setAttribute('type', 'image/webp');
      img.replaceWith(picture);
      picture.append(responsive, img);
      responsive.setAttribute('srcset', choices.map(choice => `${choice.url} ${choice.width}w`).join(', '));
      responsive.setAttribute('sizes', settings.sizes);
      if (!img.hasAttribute('width')) img.setAttribute('width', String(source.width));
      if (!img.hasAttribute('height')) img.setAttribute('height', String(source.height));
      img.setAttribute('decoding', 'async');
      if (!img.hasAttribute('loading')) img.setAttribute('loading', !img.classList.contains('avatar') && img.closest('.opening-cover, .issue-cover, .article-image, .about-page') ? 'eager' : 'lazy');
      changed = true;
    }
    if (changed) {
      await writeFile(path, document.toString());
      pages += 1;
    }
  }
  return { variants: variants.size, pages };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = await optimizeImages('dist', { base: process.env.BASE_PATH || '/' });
  console.log(`Responsive images: ${report.variants} variants; ${report.pages} pages optimized.`);
}
