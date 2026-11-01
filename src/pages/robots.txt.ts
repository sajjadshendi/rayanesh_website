import { withBase } from '../lib/paths';
import type { APIContext } from 'astro';
export function GET({ site }: APIContext) {
  const value = !site ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${new URL(withBase('/sitemap.xml'), site).href}\n`;
  return new Response(value, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
