import { searchEntries } from '../lib/search.mjs';
interface Entry { type: string; title: string; url: string; description: string; author?: string; text?: string }
const form = document.querySelector<HTMLFormElement>('#search-form')!;
const input = document.querySelector<HTMLInputElement>('#search-input')!;
const results = document.querySelector<HTMLOListElement>('#search-results')!;
const status = document.querySelector<HTMLElement>('#search-status')!;
let index: Promise<Entry[]> | undefined;
let sequence = 0;
let timer: ReturnType<typeof setTimeout>;
function loadIndex() {
  if (!index) index = fetch('/search-index.json', { credentials: 'omit' }).then(async response => {
    if (!response.ok) throw new Error('Search index unavailable');
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid index');
    return data.filter((e): e is Entry => typeof e?.title === 'string' && typeof e.description === 'string'
      && typeof e.type === 'string' && typeof e.url === 'string'
      && /^\/(articles|issues|authors)\/[a-z0-9-]+\/$/.test(e.url));
  }).catch(error => { index = undefined; throw error; });
  return index;
}
async function search() {
  const current = ++sequence;
  const query = input.value.trim().slice(0,160);
  const url = new URL(location.href);
  query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
  history.replaceState(null, '', url);
  results.replaceChildren();
  if (!query) { status.textContent = 'برای شروع، عبارتی بنویسید.'; results.removeAttribute('aria-busy'); return; }
  status.textContent = 'در حال جست‌وجو…'; results.setAttribute('aria-busy','true');
  try {
    const entries = await loadIndex();
    if (current !== sequence) return;
    const matched = searchEntries(entries, query, 30) as Entry[];
    status.textContent = matched.length ? `${matched.length.toLocaleString('fa-IR')} نتیجه (حداکثر ۳۰ نتیجه)` : 'نتیجه‌ای پیدا نشد. عبارت کوتاه‌تر یا واژهٔ دیگری امتحان کنید.';
    for (const entry of matched) {
      const li = document.createElement('li');
      const type = document.createElement('small'); type.textContent = entry.type;
      const h2 = document.createElement('h2');
      const a = document.createElement('a'); a.href = entry.url; a.textContent = entry.title; h2.append(a);
      const p = document.createElement('p'); p.textContent = entry.description;
      li.append(type,h2,p); results.append(li);
    }
  } catch { if (current === sequence) status.textContent = 'فهرست جست‌وجو بارگیری نشد. اتصال را بررسی کنید و دوباره جست‌وجو کنید.'; }
  finally { if (current === sequence) results.removeAttribute('aria-busy'); }
}
input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 180); });
form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); void search(); });
input.value = (new URL(location.href).searchParams.get('q') || '').slice(0,160);
if (input.value) void search();
