import { withBase } from '../lib/paths';
import { getCatalog, fa } from '../lib/catalog';
export async function GET() {
  const { articles, authors, issues, authorMap } = await getCatalog();
  const entries = [
    ...articles.map(a => ({
      type: 'نوشته',
      title: a.data.title,
      url: withBase(`/articles/${a.id}/`),
      description: a.data.description,
      author: a.data.authors.map(id => authorMap.get(id)!.data.name).join('، '),
      text: a.body || '',
      issue: a.data.issue,
    })),
    ...authors.filter(a => articles.some(p => p.data.authors.includes(a.id))).map(a => ({
      type: 'نویسنده',
      title: a.data.name,
      url: withBase(`/authors/${a.id}/`),
      description: a.data.bio,
    })),
    ...issues.map(i => ({
      type: 'شماره',
      title: `${i.data.kind === 'regular' && i.data.number ? `شماره ${fa(i.data.number)} — ` : i.data.kind === 'scientific' ? 'ویژه‌نامه علمی — ' : 'ویژه‌نامه — '}${i.data.title}`,
      url: withBase(`/issues/${i.id}/`),
      description: i.data.description,
      text: i.data.toc.map(t => t.title).join(' '),
      issue: i.id,
    })),
  ];
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
