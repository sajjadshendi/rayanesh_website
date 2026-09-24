import { getCollection, type CollectionEntry } from 'astro:content';
import rawSite from '../data/site.json';
import { siteSchema, topics } from './content-schema.mjs';

export const site = siteSchema.parse(rawSite);
export { topics };
export type Article = CollectionEntry<'articles'>;
export type Author = CollectionEntry<'authors'>;
export type Issue = CollectionEntry<'issues'>;
export const fa = (value: number) => value.toLocaleString('fa-IR');
export const issueLabel = (issue: Issue) => issue.data.kind === 'regular'
  ? `شمارهٔ ${fa(issue.data.number!)}` : 'ویژه‌نامه';
export const fileSize = (bytes: number) => `${(bytes / 1048576).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`;
export const readingTime = (body = '') => fa(Math.max(1, Math.ceil(body.split(/\s+/u).length / 190)));
/* Authors without a photo get a designed monogram; the tone is derived from the name so it is stable across pages. */
export const avatarTone = (name: string) => (Array.from(name).reduce((sum, ch) => sum + ch.codePointAt(0)!, 0) % 5) + 1;
/* Group letter for the alphabetical author index: alef variants collapse into one group. */
export const indexLetter = (name: string) => name.trim().charAt(0).replace(/[آأإٱ]/u, 'ا');

export async function getCatalog() {
  const [allArticles, allIssues, authors] = await Promise.all([
    getCollection('articles'), getCollection('issues'), getCollection('authors'),
  ]);
  const issues = allIssues.filter(i => !i.data.draft).sort((a, b) => b.data.order - a.data.order);
  const issueMap = new Map(issues.map(i => [i.id, i]));
  const authorMap = new Map(authors.map(a => [a.id, a]));
  const articles = allArticles.filter(a => !a.data.draft && issueMap.has(a.data.issue))
    .sort((a, b) => issueMap.get(b.data.issue)!.data.order - issueMap.get(a.data.issue)!.data.order || a.data.order - b.data.order);
  const articleMap = new Map(articles.map(a => [a.id, a]));
  return { articles, issues, authors: authors.sort((a, b) => a.data.name.localeCompare(b.data.name, 'fa')), articleMap, issueMap, authorMap };
}
