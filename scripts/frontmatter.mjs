import { load } from 'js-yaml';

export function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error('Expected plain YAML frontmatter with a closing --- delimiter.');
  if (Buffer.byteLength(match[1], 'utf8') > 65536) throw new Error('Frontmatter exceeds 64 KiB.');
  const data = load(match[1]);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Frontmatter must be a mapping.');
  return { data, content: source.slice(match[0].length) };
}
