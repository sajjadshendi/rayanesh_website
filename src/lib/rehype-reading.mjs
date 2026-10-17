import { visit, SKIP } from 'unist-util-visit';
export default function rehypeReading({ base = '/' } = {}) {
  return tree => {
    visit(tree, 'element', (node, index, parent) => {
      for (const key of ['href', 'src']) {
        const value = node.properties?.[key];
        if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
          node.properties[key] = base.replace(/\/$/, '') + value;
        }
      }
      if (node.tagName === 'pre') {
        node.properties = { ...node.properties, tabIndex: 0, 'aria-label': 'قطعه کد؛ در صورت نیاز به چپ یا راست پیمایش کنید', dir: 'ltr' };
      }
      if (node.tagName === 'img') node.properties = { ...node.properties, loading: 'lazy', decoding: 'async' };
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        parent.children[index] = { type: 'element', tagName: 'div', properties: { className: ['table-scroll'], tabIndex: 0, role: 'region', 'aria-label': 'جدول؛ در صفحه کوچک به چپ یا راست پیمایش کنید' }, children: [node] };
        return SKIP;
      }
    });
  };
}
