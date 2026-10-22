import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkSafeContent from './src/lib/remark-safe-content.mjs';
import rehypeReading from './src/lib/rehype-reading.mjs';

const configured = process.env.SITE_URL;
let site;
if (configured) {
  const url = new URL(configured);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query or fragment.');
  }
  site = url.origin;
}

const base = process.env.BASE_PATH || '/';
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base)) throw new Error('BASE_PATH must start and end with / and contain only path segments.');

export default defineConfig({
  site,
  base,
  output: 'static',
  // Opt in only HTML navigation links; never prefetch magazine PDFs or audio.
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  redirects: { '/topics': `${base}articles/` },
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  markdown: {
    processor: unified({
      smartypants: false,
      remarkPlugins: [remarkMath, remarkSafeContent],
      rehypePlugins: [[rehypeKatex, { trust: false, strict: 'error', throwOnError: true, maxExpand: 1000 }], [rehypeReading, { base }]],
      remarkRehype: { footnoteLabel: 'پانویس‌ها', footnoteBackLabel: 'بازگشت به متن' },
    }),
    shikiConfig: { theme: 'github-light', wrap: false },
  },
  vite: { build: { assetsInlineLimit: 0, sourcemap: false } },
});
