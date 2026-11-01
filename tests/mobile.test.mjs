import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import { parseHTML } from 'linkedom';

test('mobile menu and theme initialize with modern and legacy media listeners', async () => {
  const source = ts.transpile(await readFile(new URL('../src/scripts/site.ts', import.meta.url), 'utf8'), { target: ts.ScriptTarget.ES2018 });
  for (const legacy of [false, true]) {
    const { document } = parseHTML('<html data-theme="light"><head><meta name="theme-color"></head><body><header id="masthead"><nav id="site-nav"><a href="/">Home</a></nav><button id="menu-toggle" hidden></button><button id="theme-toggle" hidden></button></header></body></html>');
    const queries = [];
    const matchMedia = () => {
      const query = { matches: false };
      query[legacy ? 'addListener' : 'addEventListener'] = (...args) => { query.listener = args.at(-1); };
      queries.push(query);
      return query;
    };
    vm.runInNewContext(source, { document, matchMedia, localStorage: { getItem: () => null, setItem() {} } });
    const button = document.querySelector('#menu-toggle');
    assert.equal(button.hidden, false);
    button.click();
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    button.click();
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    document.querySelector('#theme-toggle').click();
    assert.equal(document.documentElement.dataset.theme, 'dark');
    queries[0].listener({ matches: false });
    assert.equal(document.documentElement.dataset.theme, 'light');
    button.click();
    queries[1].listener({ matches: false });
    assert.equal(button.getAttribute('aria-expanded'), 'false');
  }
});
