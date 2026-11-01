import { createHash } from 'node:crypto';
// Escape HTML delimiters before inserting data in a script element.
export function structuredData(nodes) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return { json, hash: 'sha256-' + createHash('sha256').update(json).digest('base64') };
}
