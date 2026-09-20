export function normalizePersian(value) {
  return value.normalize('NFKC').toLocaleLowerCase('fa')
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u200c\u200d]/g, ' ')
    .replace(/[۰-۹]/g, v => String(v.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, v => String(v.charCodeAt(0) - 1632))
    .replace(/\s+/g, ' ').trim();
}
export function searchEntries(entries, query, limit = 30) {
  const words = normalizePersian(query.slice(0, 160)).split(' ').filter(Boolean);
  if (!words.length) return [];
  return entries.map(entry => {
    const title = normalizePersian(entry.title);
    const body = normalizePersian(`${entry.description} ${entry.author || ''} ${entry.text || ''}`);
    return { entry, score: words.every(word => title.includes(word) || body.includes(word))
      ? words.reduce((sum, word) => sum + (title.includes(word) ? 5 : 1), 0) : 0 };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(item => item.entry);
}
