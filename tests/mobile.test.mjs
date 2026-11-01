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


test('image recovery keeps the current download until the small fallback loads and never loops', async () => {
  const source = ts.transpile(await readFile(new URL('../src/scripts/site.ts', import.meta.url), 'utf8'), { target: ts.ScriptTarget.ES2018 });
  for (const scenario of ['error', 'timeout', 'primary-wins', 'fallback-fails', 'lazy']) {
    const { document, window } = parseHTML('<html><body><picture><source srcset="/optimized.webp 750w"><img src="/fallback.png" data-image-original="/covers/20.webp" data-image-recovery="/small.jpeg"></picture></body></html>');
    Object.defineProperty(document, 'baseURI', { value: 'https://example.com/' });
    const img = document.querySelector('img');
    Object.defineProperties(img, {
      complete: { value: false, writable: true },
      naturalWidth: { value: 0, writable: true },
      currentSrc: { value: 'https://example.com/optimized.webp' },
      loading: { value: scenario === 'lazy' ? 'lazy' : 'eager' },
    });
    const probes = [];
    const timers = new Map();
    let nextTimer = 0;
    let visible;
    class Probe { constructor() { this.naturalWidth = 750; probes.push(this); } }
    class Observer { constructor(callback) { visible = callback; } observe() {} disconnect() {} }
    vm.runInNewContext(source, {
      document, URL, location: { origin: 'https://example.com' }, Image: Probe,
      IntersectionObserver: Observer,
      matchMedia: () => ({ matches: false, addEventListener() {} }),
      setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; },
      clearTimeout: id => timers.delete(id),
    });
    if (scenario === 'lazy') {
      assert.equal(timers.size, 0, 'offscreen images do not start fallback downloads');
      assert.equal(probes.length, 0);
      visible([{ isIntersecting: true }]);
    }
    if (scenario === 'error' || scenario === 'fallback-fails') img.dispatchEvent(new window.Event('error'));
    else [...timers.values()][0]();
    assert.equal(probes.length, 1);
    assert.equal(probes[0].src, 'https://example.com/small.jpeg');
    assert.ok(document.querySelector('source'), 'keep the primary request while probing');
    const callback = probes[0].onload;
    if (scenario === 'primary-wins') {
      img.complete = true;
      img.naturalWidth = 750;
      img.dispatchEvent(new window.Event('load'));
      callback();
      assert.ok(document.querySelector('source'));
      assert.equal(img.getAttribute('src'), '/fallback.png');
    } else if (scenario === 'fallback-fails') {
      probes[0].onerror();
      assert.ok(document.querySelector('source'));
    } else {
      callback();
      assert.equal(document.querySelector('source'), null);
      assert.equal(img.getAttribute('src'), 'https://example.com/small.jpeg');
    }
    img.dispatchEvent(new window.Event('error'));
    assert.equal(probes.length, 1, 'no retry loops');
    assert.equal(timers.size, 0);
  }
});


test('cover effects become available only after the full image loads', async () => {
  const source = ts.transpile(await readFile(new URL('../src/scripts/site.ts', import.meta.url), 'utf8'), { target: ts.ScriptTarget.ES2018 });
  for (const cached of [false, true]) {
    const { document, window } = parseHTML('<html><body><a class="recent-cover"><img class="recent-cover-full"></a></body></html>');
    const img = document.querySelector('img');
    Object.defineProperties(img, {
      complete: { value: cached, writable: true },
      naturalWidth: { value: cached ? 750 : 0, writable: true },
    });
    vm.runInNewContext(source, { document, matchMedia: () => ({ matches: false, addEventListener() {} }) });
    const cover = document.querySelector('a');
    assert.equal(cover.hasAttribute('data-full-ready'), cached);
    if (!cached) {
      img.dispatchEvent(new window.Event('error'));
      assert.equal(cover.hasAttribute('data-full-ready'), false);
      img.naturalWidth = 750;
      img.dispatchEvent(new window.Event('load'));
      assert.equal(cover.getAttribute('data-full-ready'), 'true');
    }
  }
});
