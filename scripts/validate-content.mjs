import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { visit } from 'unist-util-visit';
import { articleSchema, authorSchema, issueSchema, siteSchema, slugSchema, isLocalAsset } from '../src/lib/content-schema.mjs';
import remarkSafeContent from '../src/lib/remark-safe-content.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const maxAsset = 25 * 1024 * 1024;
export async function loadSources(base = root) {
  const collections = {};
  for (const [name, schema, extension] of [['articles', articleSchema, '.md'], ['authors', authorSchema, '.json'], ['issues', issueSchema, '.json']]) {
    const result = [];
    const directory = resolve(base, 'src/content', name);
    for (const file of await readdir(directory, { withFileTypes: true })) {
      if (!file.isFile() || extname(file.name) !== extension) throw new Error(`Unexpected file in ${name}: ${file.name}. Only ${extension} files are allowed.`);
      const id = basename(file.name, extension); slugSchema.parse(id);
      const source = await readFile(resolve(directory, file.name), 'utf8');
      if (extension === '.md' && !source.startsWith('---\n')) throw new Error(`${file.name}: use plain YAML frontmatter, starting with --- on its own line.`);
      const parsed = extension === '.md' ? matter(source, { language: 'yaml' }) : { data: JSON.parse(source), content: '' };
      result.push({ id, data: schema.parse(parsed.data), body: parsed.content, file: `src/content/${name}/${file.name}` });
    }
    collections[name] = result;
  }
  return { ...collections, site: siteSchema.parse(JSON.parse(await readFile(resolve(base, 'src/data/site.json'), 'utf8'))) };
}

export function validateGraph({ articles, authors, issues, site }) {
  const authorIds = new Set(authors.map(a => a.id));
  const issueMap = new Map(issues.map(i => [i.id, i]));
  const articleMap = new Map(articles.map(a => [a.id, a]));
  const unique = (values, context) => { if (new Set(values).size !== values.length) throw new Error(`Duplicate ${context}`); };
  unique(issues.map(i => i.data.order), 'issue order');
  unique(issues.filter(i => i.data.number).map(i => i.data.number), 'issue number');
  for (const a of articles) {
    for (const id of a.data.authors) if (!authorIds.has(id)) throw new Error(`${a.id}: missing author ${id}`);
    unique(a.data.authors, `author on ${a.id}`);
    unique(a.data.topics, `topic on ${a.id}`);
    const issue = issueMap.get(a.data.issue);
    if (!issue) throw new Error(`${a.id}: missing issue ${a.data.issue}`);
    if (!a.data.draft && issue.data.draft) throw new Error(`${a.id}: published article refers to a draft issue`);
    if (a.data.pdfPage > issue.data.pdfPages) throw new Error(`${a.id}: PDF page is out of range`);
    if (!a.data.draft && a.body.trim().length < 40) throw new Error(`${a.id}: published article has no readable body`);
  }
  for (const i of issues) {
    if (i.data.kind === 'regular' && !i.data.number) throw new Error(`${i.id}: regular issues require number`);
    for (const item of i.data.toc) {
      if (item.pdfPage > i.data.pdfPages) throw new Error(`${i.id}: TOC page is out of range`);
      if (item.article) {
        const a = articleMap.get(item.article);
        if (!a || a.data.issue !== i.id || (!i.data.draft && a.data.draft)) throw new Error(`${i.id}: invalid or unpublished TOC article ${item.article}`);
      }
    }
  }
  if (!issueMap.has(site.featuredIssue) || issueMap.get(site.featuredIssue).data.draft) throw new Error('Featured issue must be published');
  for (const id of site.featuredArticles) if (!articleMap.has(id) || articleMap.get(id).data.draft) throw new Error(`Featured article must be published: ${id}`);
  unique(site.featuredArticles, 'featured article');
}

async function checkAsset(path, base, expectedBytes) {
  if (!isLocalAsset(path)) return; // HTTPS links are validated by the schema; no build-time network fetch.
  const full = resolve(base, 'public', path.slice(1));
  const info = await stat(full).catch(() => { throw new Error(`Missing asset: ${path}`); });
  if (!info.isFile()) throw new Error(`Asset is not a regular file: ${path}`);
  if (info.size > maxAsset) throw new Error(`Cloudflare Pages limit exceeded (25 MiB): ${path}`);
  if (expectedBytes !== undefined && info.size !== expectedBytes) throw new Error(`${path}: pdfBytes must equal ${info.size}`);
  if (path.endsWith('.pdf')) {
    const bytes = await readFile(full);
    if (bytes.subarray(0,5).toString() !== '%PDF-') throw new Error(`Invalid PDF signature: ${path}`);
  }
}

async function checkPublic(directory, base) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = resolve(directory,entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in public: ${entry.name}`);
    if (entry.isDirectory()) { await checkPublic(full,base); continue; }
    const local = full.slice(resolve(base,'public').length+1);
    const allowed = ['_headers','_redirects','theme-init.js'].includes(local) || /\.(?:png|jpe?g|webp|avif|gif|pdf|mp3|ogg|m4a|wav|woff2?)$/.test(local);
    if (!allowed) throw new Error(`Unexpected public file (possibly active/private content): ${local}`);
    if ((await stat(full)).size > maxAsset) throw new Error(`Cloudflare Pages limit exceeded (25 MiB): ${local}`);
  }
}

export async function validateContent(base = root) {
  const catalog = await loadSources(base); validateGraph(catalog);
  await checkPublic(resolve(base,'public'),base);
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkSafeContent);
  for (const a of catalog.articles) {
    const tree = processor.parse(a.body);
    await processor.run(tree, { path: a.file, value: a.body });
    const images = [];
    const imageReferences = new Set();
    visit(tree, node => { if (node.type === 'image') images.push(node.url); if (node.type === 'imageReference') imageReferences.add(node.identifier); });
    visit(tree, 'definition', node => { if (imageReferences.has(node.identifier)) { if (!isLocalAsset(node.url)) throw new Error(`${a.id}: reference images must be local`); images.push(node.url); } });
    if (!a.data.draft) for (const asset of [a.data.image, a.data.audio?.src, ...images].filter(Boolean)) await checkAsset(asset,base);
  }
  for (const a of catalog.authors) if (a.data.avatar) await checkAsset(a.data.avatar,base);
  for (const i of catalog.issues.filter(i => !i.data.draft)) { await checkAsset(i.data.cover,base); await checkAsset(i.data.pdf,base,i.data.pdfBytes); }
  await checkAsset(catalog.site.heroImage,base);
  return catalog;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateContent();
  console.log(`Content validated: ${result.issues.length} issues, ${result.articles.filter(a => !a.data.draft).length} published articles, ${result.authors.length} authors.`);
}
