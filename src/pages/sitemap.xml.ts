import type { APIContext } from 'astro';
import { getCatalog } from '../lib/catalog';
import { xml } from '../lib/xml';
export async function GET({ site }: APIContext) {
  const { articles, issues, authors } = await getCatalog();
  const paths = site ? ['/', '/articles/', '/issues/', '/authors/', '/about/', '/privacy/', ...articles.map(a => `/articles/${a.id}/`), ...issues.map(i => `/issues/${i.id}/`), ...authors.filter(a => articles.some(p => p.data.authors.includes(a.id))).map(a => `/authors/${a.id}/`)] : [];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${xml(new URL(path, site).href)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
