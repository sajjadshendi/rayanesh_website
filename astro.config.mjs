import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkSafeContent from './src/lib/remark-safe-content.mjs';
import rehypeReading from './src/lib/rehype-reading.mjs';

const configured = process.env.SITE_URL || process.env.CF_PAGES_URL;
let site;
if (configured) {
  const url = new URL(configured);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query or fragment.');
  }
  site = url.origin;
}

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  markdown: {
    processor: unified({
      smartypants: false,
      remarkPlugins: [remarkMath, remarkSafeContent],
      rehypePlugins: [[rehypeKatex, { trust: false, strict: 'error', throwOnError: true, maxExpand: 1000 }], rehypeReading],
      remarkRehype: { footnoteLabel: 'پانویس‌ها', footnoteBackLabel: 'بازگشت به متن' },
    }),
    shikiConfig: { theme: 'github-light', wrap: false },
  },
  vite: { build: { assetsInlineLimit: 0, sourcemap: false } },
});
