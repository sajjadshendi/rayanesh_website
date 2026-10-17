import { searchEntries } from '../lib/search.mjs';
interface Entry { type: string; title: string; url: string; description: string; author?: string; text?: string; issue?: string }
const TYPES = new Set(['', 'نوشته', 'شماره', 'نویسنده']);
const ISSUE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const form = document.querySelector<HTMLFormElement>('#search-form')!;
const input = document.querySelector<HTMLInputElement>('#search-input')!;
const issueFilter = document.querySelector<HTMLSelectElement>('#search-issue');
const results = document.querySelector<HTMLOListElement>('#search-results')!;
const status = document.querySelector<HTMLElement>('#search-status')!;
const suggest = document.querySelector<HTMLElement>('.search-suggest');
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
function selectedType() {
  const value = new FormData(form).get('type');
  return typeof value === 'string' && TYPES.has(value) ? value : '';
}
function selectedIssue() {
  const value = issueFilter?.value ?? '';
  return ISSUE.test(value) ? value : '';
}
async function search() {
  const current = ++sequence;
  const query = input.value.trim().slice(0, 160);
  const type = selectedType();
  const issue = selectedIssue();
  const url = new URL(location.href);
  query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
  type ? url.searchParams.set('type', type) : url.searchParams.delete('type');
  issue ? url.searchParams.set('issue', issue) : url.searchParams.delete('issue');
  history.replaceState(null, '', url);
  results.replaceChildren();
  if (suggest) suggest.hidden = Boolean(query);
  if (!query) {
    status.textContent = 'عبارتی بنویسید تا میان نوشته‌ها، شماره‌ها و نویسندگان بگردیم.';
    results.removeAttribute('aria-busy');
    return;
  }
  status.textContent = 'در حال جست‌وجو…';
  results.setAttribute('aria-busy', 'true');
  try {
    const entries = await loadIndex();
    if (current !== sequence) return;
    const scoped = entries.filter(entry => (!type || entry.type === type) && (!issue || entry.issue === issue || (entry.type === 'شماره' && entry.url === `/issues/${issue}/`)));
    const matched = searchEntries(scoped, query, 30) as Entry[];
    status.textContent = matched.length
      ? `${matched.length.toLocaleString('fa-IR')} نتیجه (حداکثر ۳۰ نتیجه)`
      : 'نتیجه‌ای پیدا نشد. عبارت کوتاه‌تر یا نوع دیگری از نتیجه را امتحان کنید.';
    for (const entry of matched) {
      const li = document.createElement('li');
      const typeLabel = document.createElement('small');
      typeLabel.textContent = entry.type;
      const h2 = document.createElement('h2');
      const a = document.createElement('a');
      a.href = entry.url;
      a.textContent = entry.title;
      h2.append(a);
      const p = document.createElement('p');
      p.textContent = entry.description;
      li.append(typeLabel, h2, p);
      results.append(li);
    }
  } catch {
    if (current === sequence) status.textContent = 'فهرست جست‌وجو بارگیری نشد. اتصال را بررسی کنید و دوباره جست‌وجو کنید.';
  } finally {
    if (current === sequence) results.removeAttribute('aria-busy');
  }
}
input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 180); });
form.addEventListener('change', () => { clearTimeout(timer); void search(); });
form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); void search(); });
const params = new URL(location.href).searchParams;
input.value = (params.get('q') || '').slice(0, 160);
const typeParam = params.get('type') || '';
if (TYPES.has(typeParam)) {
  const radio = form.querySelector<HTMLInputElement>(`input[name="type"][value="${CSS.escape(typeParam)}"]`);
  if (radio) radio.checked = true;
}
const issueParam = params.get('issue') || '';
if (issueFilter && ISSUE.test(issueParam) && [...issueFilter.options].some(option => option.value === issueParam)) {
  issueFilter.value = issueParam;
}
if (input.value || typeParam || issueParam) void search();
