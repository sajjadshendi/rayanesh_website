import type { APIContext } from 'astro';
import { getCatalog, site as config } from '../lib/catalog';
import { xml } from '../lib/xml';
export async function GET({ site }: APIContext) {
  const { articles } = await getCatalog();
  const origin = site?.origin || 'http://localhost:4321';
  const entries = articles.slice(0, 30).map(a => `<item><title>${xml(a.data.title)}</title><link>${origin}/articles/${a.id}/</link><guid>${origin}/articles/${a.id}/</guid><description>${xml(a.data.description)}</description>${a.data.publishedAt ? `<pubDate>${new Date(a.data.publishedAt).toUTCString()}</pubDate>` : ''}</item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(config.name)}</title><link>${origin}/</link><description>${xml(config.description)}</description><language>fa</language>${entries}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
