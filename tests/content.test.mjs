import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkSafeContent from '../src/lib/remark-safe-content.mjs';
import { isSafeLink, isLocalAsset, articleSchema } from '../src/lib/content-schema.mjs';
import { normalizePersian, searchEntries } from '../src/lib/search.mjs';
import { validateGraph } from '../scripts/validate-content.mjs';

test('unsafe protocols and obfuscated asset paths are rejected', () => {
  for (const path of ['javascript:alert(1)','data:text/html,hi','//evil.example','/\\evil','/x/../secret','https://user:pass@example.com','/x%0ay']) assert.equal(isSafeLink(path),false,path);
  for (const path of ['https://example.com/a','/articles/test/','#section','mailto:editor@example.com']) assert.equal(isSafeLink(path),true,path);
  for (const path of ['/images/../secret','//host/images/a.png','/images/%2e%2e/a.png']) assert.equal(isLocalAsset(path),false,path);
});
test('raw active HTML cannot be compiled as editorial Markdown', async () => {
  const processor=unified().use(remarkParse).use(remarkGfm).use(remarkSafeContent);
  for (const body of ['<script>alert(1)</script>','<img src=x onerror=alert(1)>','[bad](javascript:alert%281%29)','![x](https://tracking.example/pixel.png)']) {
    await assert.rejects(processor.run(processor.parse(body)));
  }
  await processor.run(processor.parse('## یک عنوان\n\n**متن** و [پیوند](/issues/).'));
});
test('Persian search matches Arabic letter variants, marks, half-spaces and digits', () => {
  assert.equal(normalizePersian('كِتاب‌هاي ۱۸'),'کتاب های 18');
  const entries=[{title:'الگوریتم‌های شبکه',description:'مهدی علیزاده',url:'/articles/test/'},{title:'خانه',description:'روایت'}];
  assert.equal(searchEntries(entries,'الگوريتم هاي')[0]?.url,'/articles/test/');
  assert.equal(searchEntries(entries,'شبکه مهدی').length,1);
  assert.equal(searchEntries(entries,'').length,0);
  assert.equal(searchEntries(entries,'شبکه خانه').length,0);
});
test('new articles are drafts and image descriptions are mandatory', () => {
  const body={title:'مطلب',description:'شرح',authors:['writer'],issue:'1',pdfPage:1};
  assert.equal(articleSchema.parse(body).draft,true);
  assert.equal(articleSchema.safeParse({...body,image:'/images/image.webp'}).success,false);
});
test('broken editorial relationships and draft homepage references fail', () => {
  const catalog={authors:[{id:'writer'}],issues:[{id:'1',data:{kind:'regular',number:1,order:1,draft:false,pdfPages:3,toc:[]}}],articles:[{id:'post',body:'متن معتبر برای مقاله منتشرشده و خواندنی در وب‌سایت رایانش',data:{authors:['writer'],issue:'1',pdfPage:2,draft:false}}],site:{featuredIssue:'1',featuredArticles:['post']}};
  validateGraph(catalog);
  const broken=structuredClone(catalog); broken.articles[0].data.authors=['missing'];
  assert.throws(()=>validateGraph(broken),/missing author/);
  const draft=structuredClone(catalog); draft.articles[0].data.draft=true;
  assert.throws(()=>validateGraph(draft),/Featured article/);
  const page=structuredClone(catalog);page.articles[0].data.pdfPage=4;
  assert.throws(()=>validateGraph(page),/out of range/);
});
