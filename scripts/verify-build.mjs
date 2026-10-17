import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { parseHTML } from 'linkedom';
import { loadSources } from './validate-content.mjs';

const root = resolve('dist');
async function walk(directory) { const files = []; for (const e of await readdir(directory,{withFileTypes:true})) { const p=resolve(directory,e.name); if(e.isDirectory()) files.push(...await walk(p)); else files.push(p); } return files; }
const files = await walk(root);
const errors = [];
if (files.length > 20000) errors.push('Cloudflare Pages Free file-count limit exceeded');
for (const path of files) {
  if (/\.(?:map|md|astro|ts|env)$/.test(path)) errors.push(`Source/private file in output: ${relative(root,path)}`);
  if (path.includes('_worker.js') || path.includes('/functions/')) errors.push('Runtime code found; this site must remain static');
}
const documents = new Map();
for (const path of files.filter(p => extname(p) === '.html')) {
  const html = await readFile(path,'utf8');
  const { document } = parseHTML(html); documents.set(path,document);
  const name = relative(root,path);
  if (document.documentElement.lang !== 'fa' || document.documentElement.dir !== 'rtl') errors.push(`${name}: missing fa/rtl`);
  if (!document.querySelector('meta[name="viewport"]')) errors.push(`${name}: missing viewport`);
  if (document.querySelectorAll('h1').length !== 1) errors.push(`${name}: expected exactly one h1`);
  if (!document.querySelector('main#main') || !document.title) errors.push(`${name}: missing landmarks/title`);
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate element ids`);
  for (const node of document.querySelectorAll('script')) if (!node.getAttribute('src')) errors.push(`${name}: inline script blocked by CSP`);
  for (const node of document.querySelectorAll('*')) for (const attr of node.attributes) if (/^on/i.test(attr.name)) errors.push(`${name}: inline event handler`);
  for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) errors.push(`${name}: missing image alt`);
  for (const pre of document.querySelectorAll('.prose pre')) if (!pre.hasAttribute('tabindex')) errors.push(`${name}: code scroller not keyboard accessible`);
}
for (const [path,doc] of documents) {
  const base = new URL(`https://build.invalid/${relative(root,path).replace(/index\.html$/,'')}`);
  for (const node of doc.querySelectorAll('[href],[src]')) {
    const ref = node.getAttribute('href') || node.getAttribute('src');
    if (!ref || /^(https:|mailto:|data:)/.test(ref)) continue;
    if (/^(javascript:|vbscript:|http:|\/\/)/i.test(ref)) { errors.push(`${relative(root,path)}: unsafe URL ${ref}`); continue; }
    const url = new URL(ref,base);
    let target = resolve(root,decodeURIComponent(url.pathname).replace(/^\//,''));
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
  if (index.some(e => e.url === `/articles/${a.id}/`) === a.data.draft) errors.push(`${a.id}: draft search boundary broken`);
}
for (const i of issues) if (documents.has(resolve(root,`issues/${i.id}/index.html`)) === i.data.draft) errors.push(`${i.id}: issue publication boundary broken`);
const headers = await readFile(resolve(root,'_headers'),'utf8');
if (!headers.includes("script-src 'self'") || !headers.includes("frame-ancestors 'none'") || headers.includes("script-src 'self' 'unsafe-inline'")) errors.push('Security headers missing or weakened');
if (!files.some(p => relative(root,p) === '404.html')) errors.push('Cloudflare needs a top-level 404.html');
if (errors.length) throw new Error(`Build verification failed:\n${errors.join('\n')}`);
console.log(`Static output verified: ${documents.size} HTML pages; ${files.length} files; no broken local links, active Markdown scripts, or published drafts.`);
