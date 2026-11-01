import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseHTML, DOMParser } from 'linkedom';
const site = JSON.parse(await readFile('src/data/site.json', 'utf8'));
const origin = process.env.SITE_URL;
const prefix = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const urls = new Set(), titles = new Set();
const pages = (await readdir('dist', { recursive: true })).filter(p => p.endsWith('.html'));
for (const path of pages) {
  const { document: doc } = parseHTML(await readFile(resolve('dist', path), 'utf8'));
  if (doc.querySelector('meta[http-equiv="refresh"]')) continue;
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  const json = doc.querySelector('script[type="application/ld+json"]');
  if (!origin) { assert.match(robots, /noindex/, path); assert.equal(json, null); continue; }
  const route = '/' + path.replaceAll('\\', '/').replace(/index\.html$/, '');
  const canonical = new URL(prefix + route, origin).href;
  assert.equal(doc.querySelector('link[rel="canonical"]')?.getAttribute('href'), path === '404.html' ? undefined : canonical, path);
  assert.equal(doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content'), site.name, path);
  assert.ok(doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim(), path);
  assert.ok(doc.title.includes(site.name), path);
  assert.ok(!titles.has(doc.title), 'Duplicate title: ' + doc.title); titles.add(doc.title);
  for (const selector of ['meta[property="og:image"]', 'link[rel="icon"][type="image/png"]', 'link[rel="apple-touch-icon"]']) {
    const node = doc.querySelector(selector); assert.ok(node, selector + ' ' + path);
    const url = new URL(node.getAttribute('content') || node.getAttribute('href'), origin);
    assert.equal(url.origin, new URL(origin).origin);
    assert.ok(url.pathname.startsWith(prefix + '/'));
    assert.ok((await stat(resolve('dist', '.' + url.pathname.slice(prefix.length)))).isFile());
  }
  if (/noindex/.test(robots)) { assert.equal(json, null); continue; }
  urls.add(canonical);
  assert.ok(json, 'Missing schema: ' + path);
  const graph = JSON.parse(json.textContent)['@graph'];
  assert.equal(graph.find(n => n['@type'] === 'WebSite')?.name, site.name);
  assert.equal(graph.find(n => n['@type'] === 'WebSite')?.url, new URL(prefix + '/', origin).href);
  assert.ok(graph.some(n => n.url === canonical && ['WebPage', 'ProfilePage'].includes(n['@type'])));
  if (/^\/articles\/.+\/$/.test(route)) {
    const article = graph.find(n => n['@type'] === 'Article'); assert.ok(article, path);
    assert.equal(article.headline, doc.querySelector('h1').textContent);
    assert.ok(article.author.length && article.author.every(a => a.name && a.url));
    assert.ok(article.image && article.publisher['@id']);
  }
  if (doc.querySelector('.breadcrumb')) {
    const crumbs = [...doc.querySelectorAll('.breadcrumb [itemprop="position"]')];
    assert.ok(crumbs.length >= 2);
    crumbs.forEach((c, i) => assert.equal(c.getAttribute('content'), String(i + 1)));
  }
}
const xml = new DOMParser().parseFromString(await readFile('dist/sitemap.xml', 'utf8'), 'text/xml');
const locations = [...xml.querySelectorAll('loc')].map(n => n.textContent);
assert.equal(locations.length, new Set(locations).size);
assert.deepEqual(new Set(locations), urls, 'Sitemap must contain exactly the indexable canonical pages');
const robots = await readFile('dist/robots.txt', 'utf8');
if (origin) { assert.ok(!robots.includes('Disallow:')); assert.ok(robots.includes(new URL(prefix + '/sitemap.xml', origin).href)); }
else assert.match(robots, /Disallow: \//);
console.log('SEO verified: ' + urls.size + ' indexable pages; canonical URLs, metadata, schemas, icons and sitemap agree.');
