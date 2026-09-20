export {};
const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
function updateLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
  if (toggle) { toggle.textContent = dark ? 'حالت روشن' : 'حالت تیره'; toggle.setAttribute('aria-label', dark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تیره'); }
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
