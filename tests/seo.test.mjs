import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';
import { structuredData } from '../src/lib/seo.mjs';
test('JSON-LD escapes HTML without changing content and hashes the emitted bytes', () => {
  const nodes = [{ '@type': 'Article', headline: '</script><script>alert(1)</script> & "quoted"' }];
  const { json, hash } = structuredData(nodes);
  assert.doesNotMatch(json, /[<>&]/);
  assert.deepEqual(JSON.parse(json)['@graph'], nodes);
  assert.equal(hash, 'sha256-' + createHash('sha256').update(json).digest('base64'));
  const { document } = parseHTML('<html><head><script type="application/ld+json">' + json + '</script></head></html>');
  assert.equal(document.querySelectorAll('script').length, 1);
  assert.equal(document.querySelector('script').textContent, json);
});
