import { normalizePersian } from '../lib/search.mjs';

const root = document.querySelector<HTMLElement>('[data-articles]');
const input = document.querySelector<HTMLInputElement>('#articles-find');
if (!root || !input) throw new Error('Articles archive is missing.');

const cards = [...root.querySelectorAll<HTMLElement>('[data-card]')];
const links = [...root.querySelectorAll<HTMLAnchorElement>('a[data-issue]')];
const empty = root.querySelector<HTMLElement>('[data-articles-empty]');
const form = root.querySelector<HTMLFormElement>('.articles-find');
const fa = (value: number) => value.toLocaleString('fa-IR');

const read = () => {
  const url = new URL(location.href);
  return { issue: (url.searchParams.get('issue') ?? '').slice(0, 100), query: (url.searchParams.get('q') ?? '').slice(0, 160) };
};

const write = (issue: string, query: string) => {
  const url = new URL(location.href);
  issue ? url.searchParams.set('issue', issue) : url.searchParams.delete('issue');
  query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
  history.replaceState(null, '', url);
};

const matchesQuery = (haystack: string, query: string) => {
  const words = normalizePersian(query).split(' ').filter(Boolean);
  if (!words.length) return true;
  const text = normalizePersian(haystack);
  return words.every((word: string) => text.includes(word));
};

const apply = () => {
  const { issue, query } = read();
  links.forEach(link => {
    if ((link.dataset.issue ?? '') === issue) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  let visible = 0;
  cards.forEach(card => {
    const show = (!issue || card.dataset.issue === issue) && matchesQuery(card.dataset.find ?? '', query);
    card.hidden = !show;
    if (show) visible += 1;
  });
  input.placeholder = `${fa(visible)} نوشته`;
  if (empty) empty.hidden = visible > 0;
};

input.value = read().query;
apply();
if (location.hash === '#find') input.focus();

input.addEventListener('input', () => {
  write(read().issue, input.value.trim());
  apply();
});
form?.addEventListener('submit', event => {
  event.preventDefault();
  write(read().issue, input.value.trim());
  apply();
});
links.forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const next = (link.dataset.issue ?? '') === read().issue ? '' : (link.dataset.issue ?? '');
  write(next, input.value.trim());
  apply();
}));
addEventListener('hashchange', () => { if (location.hash === '#find') input.focus(); });
