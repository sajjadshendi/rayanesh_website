import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../scripts/frontmatter.mjs';
import { isSafeLink, isHttps } from '../src/lib/content-schema.mjs';
import katex from 'katex';

test('frontmatter accepts plain YAML and rejects executable tags and ambiguous input', () => {
  const parsed = parseFrontmatter('---\ntitle: نمونه\ndraft: true\n---\nمتن');
  assert.deepEqual(parsed, { data: { title: 'نمونه', draft: true }, content: 'متن' });
  for (const input of ['---js\nmodule.exports = {}\n---\n', '---\ntitle: x\n', '---\n- item\n---\n', '---\ntitle: a\ntitle: b\n---\n', '---\nx: !!js/function function() {}\n---\n', `---\nx: ${'x'.repeat(65536)}\n---\n`]) assert.throws(() => parseFrontmatter(input));
});

test('encoded traversal, control characters and noncanonical HTTPS links fail closed', () => {
  for (const value of ['/a/%2e%2e/private', '/a/.%2E/private', '/a/%2E./private', '/a%00b', '/a%1fb', '/a%5Cb', 'https:evil.example', 'https:/evil.example']) assert.equal(isSafeLink(value), false, value);
  assert.equal(isHttps('https:evil.example'), false);
  assert.equal(isSafeLink('/articles/test/?q=%D8%B1'), true);
});

test('math renders ordinary formulas but cannot enable trusted HTML or URL commands', () => {
  const options = { trust: false, strict: 'error', throwOnError: true, maxExpand: 1000 };
  assert.match(katex.renderToString('x^2 + y^2', options), /class="katex"/);
  for (const tex of [String.raw`\href{javascript:alert(1)}{click}`, String.raw`\includegraphics{https://evil.example/pixel.png}`, String.raw`\htmlClass{evil}{x}`]) {
    let html = '';
    try { html = katex.renderToString(tex, options); } catch { continue; }
    assert.doesNotMatch(html, /<(?:a|img)\b|class="evil"/);
  }
});
