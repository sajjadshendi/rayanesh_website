import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugSchema } from '../src/lib/content-schema.mjs';

const [kind, slug] = process.argv.slice(2);
const extension = { article: 'md', author: 'json', issue: 'json' }[kind];
if (!extension || !slugSchema.safeParse(slug).success) {
  console.error('Usage: npm run new -- article|author|issue english-slug');
  process.exitCode = 1;
} else {
  const root = fileURLToPath(new URL('..',import.meta.url));
  const template = await readFile(resolve(root,`scripts/templates/${kind}.${extension}`),'utf8');
  const destination = resolve(root,`src/content/${kind}s/${slug}.${extension}`);
  try {
    await writeFile(destination,template,{flag:'wx'});
    console.log(`Created ${destination}.`);
  } catch(error) {
    if (error.code === 'EEXIST') { console.error('This slug already exists; nothing was overwritten.'); process.exitCode = 1; }
    else throw error;
  }
}
