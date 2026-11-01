import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { parseHTML } from 'linkedom';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeReading from '../src/lib/rehype-reading.mjs';
import { themeInit } from '../src/lib/theme.mjs';
import { optimizeImages } from '../scripts/optimize-images.mjs';

test('production images preserve originals, CSP and base paths, share variants, and never upscale', async t => {
  const root = await mkdtemp(join(tmpdir(), 'rayanesh-perf-'));
  t.after(async () => {
    assert.ok(resolve(root).startsWith(resolve(tmpdir()) + '\\rayanesh-perf-') || resolve(root).startsWith(resolve(tmpdir()) + '/rayanesh-perf-'));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(join(root, 'images'));
  const original = await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#284b3b' } }).jpeg().toBuffer();
  await writeFile(join(root, 'images', 'room.jpg'), original);
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><script>${themeInit}</script></head><body><main class="about-page"><img src="/mag/images/room.jpg" alt="room"><img class="avatar avatar-lg" src="/mag/images/room.jpg" width="64" height="64" alt=""><a href="/mag/downloads/issue.pdf">PDF</a></main></body></html>`;
  await writeFile(join(root, 'index.html'), html);
  await writeFile(join(root, 'second.html'), html);
  const report = await optimizeImages(root, { base: '/mag/' });
  assert.equal(report.pages, 2);
  assert.equal(report.variants, 16);
  const output = await readFile(join(root, 'index.html'), 'utf8');
  const { document } = parseHTML(output);
  assert.equal(document.querySelector('script').textContent, themeInit);
  assert.equal(document.querySelector('a').getAttribute('href'), '/mag/downloads/issue.pdf');
  assert.deepEqual(await readFile(join(root, 'images', 'room.jpg')), original);
  const [image, avatar] = document.querySelectorAll('img');
  assert.equal(image.getAttribute('width'), '900');
  assert.equal(image.getAttribute('height'), '1200');
  assert.equal(image.getAttribute('loading'), 'eager');
  assert.equal(avatar.getAttribute('loading'), 'lazy');
  assert.equal(avatar.previousElementSibling.getAttribute('sizes'), '72px');
  assert.match(image.getAttribute('src'), /^\/mag\/_astro\/.+\.jpeg$/);
  assert.equal(image.getAttribute('data-image-recovery'), image.getAttribute('src'));
  assert.equal(image.parentElement.querySelector('source').getAttribute('type'), 'image/avif');
  assert.equal(image.getAttribute('data-image-original'), '/mag/images/room.jpg');
  assert.equal(image.previousElementSibling.getAttribute('type'), 'image/webp');
  for (const img of [image, avatar]) {
    for (const entry of [...img.parentElement.querySelectorAll('source')].flatMap(source => source.getAttribute('srcset').split(','))) {
      const [url, descriptor] = entry.trim().split(/\s+/);
      assert.ok(url.startsWith('/mag/_astro/'));
      const metadata = await sharp(await readFile(join(root, url.slice('/mag/'.length)))).metadata();
      assert.equal(metadata.width, Number(descriptor.slice(0, -1)));
      assert.ok(metadata.width <= 900);
    }
  }
  assert.equal(await readFile(join(root, 'second.html'), 'utf8'), output);
  assert.equal((await optimizeImages(root, { base: '/mag/' })).variants, 0);
  const oldSrc = image.previousElementSibling.getAttribute('srcset');
  await writeFile(join(root, 'images', 'room.jpg'), await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#ffffff' } }).jpeg().toBuffer());
  await writeFile(join(root, 'index.html'), html);
  await optimizeImages(root, { base: '/mag/' });
  const updated = parseHTML(await readFile(join(root, 'index.html'), 'utf8')).document;
  assert.notEqual(updated.querySelector('source').getAttribute('srcset'), oldSrc);
});

test('math styles are requested only for rendered math, including inline formulas', async () => {
  const processor = await createMarkdownProcessor({ remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, { trust: false, strict: 'error', throwOnError: true }], rehypeReading] });
  for (const [text, expected] of [['An ordinary article with $5 in text.', false], ['Inline $x^2$ formula.', true], ['$$\nx+y\n$$', true]]) {
    const result = await processor.render(text);
    assert.equal(result.metadata.frontmatter.hasMath, expected);
  }
});


test('WebP originals include a decodable fallback and preserve transparency', async t => {
  const root = await mkdtemp(join(tmpdir(), 'rayanesh-fallback-'));
  t.after(async () => { await rm(root, { recursive: true, force: true }); });
  await mkdir(join(root, 'images'));
  await writeFile(join(root, 'images', 'cover.webp'), await sharp({ create: { width: 100, height: 150, channels: 4, background: { r: 40, g: 75, b: 59, alpha: 0.5 } } }).webp().toBuffer());
  await writeFile(join(root, 'index.html'), '<html><body><img src="/mag/images/cover.webp" alt="cover"></body></html>');
  await optimizeImages(root, { base: '/mag/' });
  const { document } = parseHTML(await readFile(join(root, 'index.html'), 'utf8'));
  const img = document.querySelector('picture img');
  assert.ok(img);
  assert.equal(img.getAttribute('data-image-original'), '/mag/images/cover.webp');
  const fallback = img.getAttribute('src');
  assert.match(fallback, /^\/mag\/_astro\/.+\.png$/);
  const metadata = await sharp(join(root, fallback.slice('/mag/'.length))).metadata();
  assert.equal(metadata.format, 'png');
  assert.equal(metadata.width, 100);
  assert.equal(metadata.height, 150);
  assert.equal(metadata.hasAlpha, true);
  assert.equal(document.querySelector('source').getAttribute('type'), 'image/avif');
  assert.equal((await optimizeImages(root, { base: '/mag/' })).variants, 0);
});


test('all real covers stay under 60 KB; recent images use a landscape crop and small full cover', async t => {
  const root = await mkdtemp(join(tmpdir(), 'rayanesh-cover-budget-'));
  t.after(async () => { await rm(root, { recursive: true, force: true }); });
  await mkdir(join(root, 'covers'));
  const names = ['15', '16', '17', '18', '19', '20', 'freshers-1403', 'freshers-1404', 'ganjeh', 'nowruz'];
  for (const name of names) await writeFile(join(root, 'covers', name + '.webp'), await readFile(new URL('../public/covers/' + name + '.webp', import.meta.url)));
  const covers = names.map(name => '<div class="issue-cover"><img src="/covers/' + name + '.webp"></div>').join('');
  const recent = ['20', 'freshers-1404'].map(name => '<a class="recent-cover"><img class="recent-cover-crop" src="/covers/' + name + '.webp"><img class="recent-cover-full" src="/covers/' + name + '.webp"></a>').join('');
  await writeFile(join(root, 'index.html'), '<html><body>' + covers + recent + '</body></html>');
  await optimizeImages(root);
  const { document } = parseHTML(await readFile(join(root, 'index.html'), 'utf8'));
  for (const img of document.querySelectorAll('img')) {
    const urls = [img.getAttribute('src'), ...[...img.parentElement.querySelectorAll('source')].flatMap(source => source.getAttribute('srcset').split(',').map(entry => entry.trim().split(' ')[0]))];
    for (const url of urls) {
      const bytes = await readFile(join(root, url.slice(1)));
      assert.ok(bytes.length < 60000, url + ' exceeds cover transfer budget');
      const metadata = await sharp(bytes).metadata();
      if (img.classList.contains('recent-cover-crop')) {
        assert.ok(Math.abs(metadata.height - metadata.width * 9 / 16) <= 1);
        assert.ok(bytes.length < 30000, 'recent crop exceeds 30 KB');
      } else if (img.classList.contains('recent-cover-full')) {
        assert.ok(metadata.width <= 240);
        assert.ok(bytes.length < 20000, 'recent full cover exceeds 20 KB');
      } else assert.ok(metadata.width <= 480);
    }
  }
});
