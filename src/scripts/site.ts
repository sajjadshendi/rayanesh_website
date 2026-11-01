// Older Safari exposes only the legacy MediaQueryList listener API.
function onMediaChange(query: MediaQueryList, listener: (event: MediaQueryListEvent) => void) {
  if (typeof query.addEventListener === 'function') query.addEventListener('change', listener);
  else query.addListener(listener);
}
const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
function savedTheme() {
  try { return localStorage.getItem('rayanesh-theme'); } catch { return null; }
}
function updateLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
  toggle?.setAttribute('aria-label', dark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تیره');
  toggle?.setAttribute('aria-pressed', String(dark));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191d19' : '#f4f0e7');
}
if (toggle) {
  toggle.hidden = false;
  updateLabel();
  toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('rayanesh-theme', theme); } catch { /* Optional preference only. */ }
    updateLabel();
  });
}
onMediaChange(systemDark, event => {
  if (savedTheme()) return;
  document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
  updateLabel();
});

// Without this script the mobile nav stays visible as a scrollable row.
const masthead = document.querySelector<HTMLElement>('#masthead');
const menuToggle = document.querySelector<HTMLButtonElement>('#menu-toggle');
if (masthead && menuToggle) {
  const setMenu = (open: boolean) => {
    masthead.dataset.menu = open ? 'open' : 'closed';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  };
  menuToggle.hidden = false;
  setMenu(false);
  const mobileMenu = matchMedia('(max-width: 860px)');
  onMediaChange(mobileMenu, () => {
    const focusWasInNav = Boolean(document.activeElement?.closest('#site-nav'));
    const focusWasOnToggle = document.activeElement === menuToggle;
    setMenu(false);
    if (mobileMenu.matches && focusWasInNav) menuToggle.focus();
    if (!mobileMenu.matches && focusWasOnToggle) masthead.querySelector<HTMLAnchorElement>('#site-nav a')?.focus();
  });
  menuToggle.addEventListener('click', () => setMenu(masthead.dataset.menu !== 'open'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && masthead.dataset.menu === 'open') { setMenu(false); menuToggle.focus(); }
  });
  masthead.querySelector('#site-nav')?.addEventListener('click', event => {
    if ((event.target as HTMLElement).closest('a')) setMenu(false);
  });
}

const archive = document.querySelector<HTMLElement>('[data-archive]');
if (archive) {
  const tabs = [...archive.querySelectorAll<HTMLAnchorElement>('[data-archive-tab]')];
  const panels = [...archive.querySelectorAll<HTMLElement>('[data-archive-panel]')];
  const show = (id: string) => {
    tabs.forEach(tab => {
      if (tab.dataset.archiveTab === id) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.archivePanel !== id; });
  };
  const ids = new Set(tabs.map(tab => tab.dataset.archiveTab));
  const fromHash = () => ids.has(location.hash.slice(1)) ? location.hash.slice(1) : 'regular';
  show(fromHash());
  tabs.forEach(tab => tab.addEventListener('click', () => show(tab.dataset.archiveTab ?? 'regular')));
  addEventListener('hashchange', () => show(fromHash()));
}

// A picture's format fallback does not handle network errors automatically.
// Probe the untouched original without cancelling a potentially slow download.
// Only visible images get a timeout, and each image gets at most one probe.
for (const img of document.querySelectorAll<HTMLImageElement>('img[data-image-original]')) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let probe: HTMLImageElement | undefined;
  let observer: IntersectionObserver | undefined;
  let started = false;
  let attempted = false;
  let finished = false;
  const loaded = () => img.complete && img.naturalWidth > 0;
  const cleanup = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    observer?.disconnect();
    if (probe) { probe.onload = null; probe.onerror = null; }
    img.removeEventListener('error', recover);
    img.removeEventListener('load', finish);
  };
  const finish = () => {
    finished = true;
    cleanup();
  };
  const recover = () => {
    if (attempted || finished || loaded()) return;
    attempted = true;
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    const original = img.dataset.imageOriginal;
    if (!original) return;
    const url = new URL(original, document.baseURI);
    // Do not retry the same URL or send image requests to other hosts.
    if (url.origin !== location.origin || url.href === (img.currentSrc || img.src)) return;
    probe = new Image();
    probe.onload = () => {
      if (finished || loaded() || !probe?.naturalWidth) { finish(); return; }
      finish();
      // Remove sources only after a complete replacement has arrived.
      img.closest('picture')?.querySelectorAll('source').forEach(source => source.remove());
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = url.href;
    };
    probe.onerror = finish;
    probe.src = url.href;
  };
  const start = () => {
    if (started || finished) return;
    started = true;
    observer?.disconnect();
    if (loaded()) { finish(); return; }
    if (img.complete) recover();
    else timer = setTimeout(recover, 20000);
  };
  img.addEventListener('load', finish);
  img.addEventListener('error', recover);
  if (loaded()) finish();
  else if (img.loading !== 'lazy' || typeof IntersectionObserver === 'undefined') start();
  else {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start();
    });
    observer.observe(img);
  }
}
