export {};
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
systemDark.addEventListener('change', event => {
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
  const fromHash = () => location.hash === '#special' ? 'special' : 'regular';
  show(fromHash());
  tabs.forEach(tab => tab.addEventListener('click', () => show(tab.dataset.archiveTab ?? 'regular')));
  addEventListener('hashchange', () => show(fromHash()));
}

const compactFooter = matchMedia('(max-width: 760px)');
const footerCols = [...document.querySelectorAll<HTMLDetailsElement>('.footer-col')];
const syncFooter = () => {
  footerCols.forEach(col => { col.open = !compactFooter.matches; });
};
if (footerCols.length) {
  syncFooter();
  compactFooter.addEventListener('change', syncFooter);
}
