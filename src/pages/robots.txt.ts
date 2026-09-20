import type { APIContext } from 'astro';
export function GET({ site }: APIContext) {
  const preview = import.meta.env.CF_PAGES === '1' && import.meta.env.CF_PAGES_BRANCH !== 'main';
  const value = !site || preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /search/\nSitemap: ${new URL('/sitemap.xml', site).href}\n`;
  return new Response(value, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
