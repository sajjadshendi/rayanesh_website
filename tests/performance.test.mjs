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
  assert.equal(report.variants, 5);
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
  assert.equal(avatar.getAttribute('sizes'), '72px');
  for (const img of [image, avatar]) {
    for (const entry of img.getAttribute('srcset').split(',')) {
      const [url, descriptor] = entry.trim().split(/\s+/);
      assert.ok(url.startsWith('/mag/_astro/'));
      const metadata = await sharp(await readFile(join(root, url.slice('/mag/'.length)))).metadata();
      assert.equal(metadata.width, Number(descriptor.slice(0, -1)));
      assert.ok(metadata.width <= 900);
    }
  }
  assert.equal(await readFile(join(root, 'second.html'), 'utf8'), output);
  assert.equal((await optimizeImages(root, { base: '/mag/' })).variants, 0);
  const oldSrc = image.getAttribute('src');
  await writeFile(join(root, 'images', 'room.jpg'), await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#ffffff' } }).jpeg().toBuffer());
  await writeFile(join(root, 'index.html'), html);
  await optimizeImages(root, { base: '/mag/' });
  const updated = parseHTML(await readFile(join(root, 'index.html'), 'utf8')).document;
  assert.notEqual(updated.querySelector('img').getAttribute('src'), oldSrc);
});

test('math styles are requested only for rendered math, including inline formulas', async () => {
  const processor = await createMarkdownProcessor({ remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, { trust: false, strict: 'error', throwOnError: true }], rehypeReading] });
  for (const [text, expected] of [['An ordinary article with $5 in text.', false], ['Inline $x^2$ formula.', true], ['$$\nx+y\n$$', true]]) {
    const result = await processor.render(text);
    assert.equal(result.metadata.frontmatter.hasMath, expected);
  }
});
