import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { parseHTML } from 'linkedom';
import { isSafeLink } from '../src/lib/content-schema.mjs';
import { themeInit, themeHash } from '../src/lib/theme.mjs';
import { loadSources } from './validate-content.mjs';

const root = resolve('dist');
const prefix = (process.env.BASE_PATH || '/').replace(/\/$/, '');
async function walk(directory) { const files = []; for (const e of await readdir(directory,{withFileTypes:true})) { const p=resolve(directory,e.name); if(e.isDirectory()) files.push(...await walk(p)); else files.push(p); } return files; }
const files = await walk(root);
const errors = [];

for (const path of files) {
  if (/\.(?:map|md|astro|ts|env)$/.test(path)) errors.push(`Source/private file in output: ${relative(root,path)}`);
  if (path.includes('_worker.js') || path.includes('/functions/')) errors.push('Runtime code found; this site must remain static');
}
const documents = new Map();
for (const path of files.filter(p => extname(p) === '.html')) {
  const html = await readFile(path,'utf8');
  const { document } = parseHTML(html); documents.set(path,document);
  const name = relative(root,path).replaceAll('\\', '/');
  for (const node of document.querySelectorAll('*')) for (const attr of node.attributes) if (/^on/i.test(attr.name)) errors.push(`${name}: inline event handler`);
  const refresh = document.querySelector('meta[http-equiv="refresh"]');
  if (refresh) {
    if (name !== 'topics/index.html' || refresh.getAttribute('content') !== `0;url=${prefix}/articles/`
      || document.querySelector('script,iframe,object,embed')) errors.push(`${name}: unexpected redirect document`);
    else continue;
  }
  if (document.documentElement.lang !== 'fa' || document.documentElement.dir !== 'rtl') errors.push(`${name}: missing fa/rtl`);
  if (!document.querySelector('meta[name="viewport"]')) errors.push(`${name}: missing viewport`);
  if (document.querySelectorAll('h1').length !== 1) errors.push(`${name}: expected exactly one h1`);
  if (!document.querySelector('main#main') || !document.title) errors.push(`${name}: missing landmarks/title`);
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate element ids`);
  const dataScripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
  for (const script of dataScripts) {
    try { const data = JSON.parse(script.textContent); if (data['@context'] !== 'https://schema.org' || !Array.isArray(data['@graph'])) throw new Error('Invalid graph'); } catch { errors.push(name + ': invalid JSON-LD'); }
    const hash = 'sha256-' + createHash('sha256').update(script.textContent).digest('base64');
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content').includes(hash)) errors.push(name + ': JSON-LD hash missing');
  }
  const inlineScripts = [...document.querySelectorAll('script')].filter(node => !node.getAttribute('src') && node.getAttribute('type') !== 'application/ld+json');
  if (inlineScripts.length !== 1 || inlineScripts[0].textContent !== themeInit) errors.push(`${name}: unexpected or missing theme bootstrap`);
  // Prefetch is limited to same-origin HTML pages, never large downloads or external links.
  for (const link of document.querySelectorAll('a[data-astro-prefetch]')) {
    const href = link.getAttribute('href') || '';
    const target = new URL(href, 'https://build.invalid');
    if (!href.startsWith(`${prefix}/`) || target.origin !== 'https://build.invalid'
      || !target.pathname.endsWith('/')) errors.push(`${name}: non-page prefetch target ${href}`);
  }
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) errors.push(`${name}: missing image alt`);
    const responsive = img.parentElement?.tagName === 'PICTURE' ? img.parentElement.querySelector('source') : img;
    if (responsive?.hasAttribute('srcset')) {
      if (!responsive.hasAttribute('sizes') || !img.hasAttribute('width') || !img.hasAttribute('height')) errors.push(`${name}: responsive image missing dimensions/sizes`);
      for (const candidate of responsive.getAttribute('srcset').split(',')) {
        const [url, descriptor] = candidate.trim().split(/\s+/);
        const local = url.slice(prefix.length);
        if (!url.startsWith(`${prefix}/_astro/`) || !/^\d+w$/.test(descriptor || '') || !await stat(resolve(root, `.${local}`)).then(s => s.isFile()).catch(() => false)) errors.push(`${name}: invalid responsive image ${candidate}`);
      }
    }
  }
  for (const pre of document.querySelectorAll('.prose pre')) if (!pre.hasAttribute('tabindex')) errors.push(`${name}: code scroller not keyboard accessible`);
}
for (const [path,doc] of documents) {
  const base = new URL(`https://build.invalid${prefix}/${relative(root,path).replace(/index\.html$/,'')}`);
  for (const node of doc.querySelectorAll('[href],[src]')) {
    const ref = node.getAttribute('href') || node.getAttribute('src');
    if (!ref) continue;
    if (!isSafeLink(ref)) { errors.push(`${relative(root,path)}: unsafe URL ${ref}`); continue; }
    if (/^(https:|mailto:)/i.test(ref)) {
      if (node.hasAttribute('src') || node.tagName === 'SCRIPT') errors.push(`${relative(root,path)}: external resource ${ref}`);
      continue;
    }
    if (/^(javascript:|vbscript:|http:|\/\/)/i.test(ref)) { errors.push(`${relative(root,path)}: unsafe URL ${ref}`); continue; }
    const url = new URL(ref,base);
    if (prefix && !url.pathname.startsWith(`${prefix}/`)) { errors.push(`${relative(root,path)}: URL escapes site base ${ref}`); continue; }
    let target = resolve(root,decodeURIComponent(url.pathname.slice(prefix.length)).replace(/^\//,''));
    if (url.pathname.endsWith('/')) target = resolve(target,'index.html');
    const exists = await stat(target).then(s => s.isFile()).catch(() => false);
    if (!exists) { errors.push(`${relative(root,path)}: broken link ${ref}`); continue; }
    if (url.hash && target.endsWith('.html') && !documents.get(target)?.getElementById(decodeURIComponent(url.hash.slice(1)))) errors.push(`${relative(root,path)}: missing anchor ${ref}`);
  }
}
const { articles, issues } = await loadSources();
const index = JSON.parse(await readFile(resolve(root,'search-index.json'),'utf8'));
for (const a of articles) {
  const exists = documents.has(resolve(root,`articles/${a.id}/index.html`));
  if (exists === a.data.draft) errors.push(`${a.id}: draft publication boundary broken`);
  if (index.some(e => e.url === `${prefix}/articles/${a.id}/`) === a.data.draft) errors.push(`${a.id}: draft search boundary broken`);
}
for (const i of issues) if (documents.has(resolve(root,`issues/${i.id}/index.html`)) === i.data.draft) errors.push(`${i.id}: issue publication boundary broken`);
for (const [path, doc] of documents) {
  // Astro redirect documents have no application scripts or UI.
  if (doc.querySelector('meta[http-equiv="refresh"]')) continue;
  const csp = doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || '';
  const directives = csp.split(';').map(value => value.trim());
  const hashes = [themeHash, ...[...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => 'sha256-' + createHash('sha256').update(node.textContent).digest('base64'))];
  const expectedScripts = "script-src 'self' " + hashes.map(hash => "'" + hash + "'").join(' ');
  if (!["default-src 'self'", "script-src-attr 'none'", "worker-src 'none'", "object-src 'none'", "base-uri 'none'"].every(value => directives.includes(value)) || !directives.includes(expectedScripts) || /'unsafe-eval'|'unsafe-inline'/.test(directives.find(value => value.startsWith('script-src ')) || '')) errors.push(`${relative(root,path)}: CSP missing or weakened`);
}
if (!files.some(p => relative(root,p) === '404.html')) errors.push('GitHub Pages needs a top-level 404.html');
if (errors.length) throw new Error(`Build verification failed:\n${errors.join('\n')}`);
console.log(`Static output verified: ${documents.size} HTML pages; ${files.length} files; no broken local links, active Markdown scripts, or published drafts.`);
