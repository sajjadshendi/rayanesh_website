import { visit } from 'unist-util-visit';
import { isSafeLink, assetSchema } from './content-schema.mjs';

// Markdown is data, never executable MDX/HTML. Fail visibly instead of silently
// publishing an edited article with missing or potentially active content.
export default function remarkSafeContent() {
  return (tree, file) => {
    const imageReferences = new Set();
    visit(tree, 'imageReference', node => {
      imageReferences.add(node.identifier);
      if (!node.alt?.trim()) file.fail('Images need meaningful alt text.', node);
    });
    visit(tree, (node) => {
      if (node.type === 'html') file.fail('Raw HTML is disabled. Use Markdown.', node);
      if (node.type === 'heading' && node.depth === 1) file.fail('Start article sections at ##; the page supplies h1.', node);
      if (['link', 'definition'].includes(node.type) && !isSafeLink(node.url)) {
        file.fail('Unsafe link. Use HTTPS, mailto, /local-path/ or #anchor.', node);
      }
      if (node.type === 'image' && (!assetSchema.safeParse(node.url).success || !node.alt?.trim())) {
        file.fail('Images must use a local asset path and meaningful alt text.', node);
      }
      if (node.type === 'definition' && imageReferences.has(node.identifier) && !assetSchema.safeParse(node.url).success) file.fail('Reference images must use local assets.', node);
    });
  };
}
