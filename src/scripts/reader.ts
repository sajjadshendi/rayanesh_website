export {};
const controls = document.querySelector<HTMLElement>('#reader-controls');
const increase = document.querySelector<HTMLButtonElement>('#font-increase');
const decrease = document.querySelector<HTMLButtonElement>('#font-decrease');
const status = document.querySelector<HTMLElement>('#font-status');
let size = 18;
try { const saved = Number(localStorage.getItem('rayanesh-font-size')); if (saved >= 16 && saved <= 24) size = saved; } catch { /* Optional preference only. */ }
function applySize(announce = false) {
  document.documentElement.style.setProperty('--reader-size', `${size / 16}rem`);
  if (increase) increase.disabled = size >= 24;
  if (decrease) decrease.disabled = size <= 16;
  if (announce && status) status.textContent = `اندازه متن: ${size.toLocaleString('fa-IR')}`;
}
if (controls) { controls.hidden = false; applySize(); }
for (const [button, step] of [[increase, 1], [decrease, -1]] as const) button?.addEventListener('click', () => {
  size = Math.min(24, Math.max(16, size + step)); applySize(true);
  try { localStorage.setItem('rayanesh-font-size', String(size)); } catch { /* Optional preference only. */ }
});
const share = document.querySelector<HTMLButtonElement>('#share-article');
const shareStatus = document.querySelector<HTMLElement>('#share-status');
if (share && (navigator.share || navigator.clipboard?.writeText)) {
  share.hidden = false;
  share.addEventListener('click', async () => {
    const url = new URL(location.pathname, location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: document.title, url });
      else { await navigator.clipboard.writeText(url); if (shareStatus) shareStatus.textContent = 'پیوند کپی شد.'; }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError') && shareStatus) shareStatus.textContent = 'می‌توانید نشانی صفحه را از نوار آدرس کپی کنید.';
    }
  });
}
// On small screens keep the article ahead of a long contents list.
const toc = document.querySelector<HTMLDetailsElement>('.reading-toc');
if (toc && matchMedia('(max-width: 760px)').matches) toc.open = false;
