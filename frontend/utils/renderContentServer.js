// Server-safe content renderer — no client-only extensions (no ReactNodeViewRenderer)
import { generateHTML } from '@tiptap/html';
import { Node, mergeAttributes } from '@tiptap/core';
import { getBaseExtensions } from './tiptapBaseExtensions';

// Server-safe ImageBlock — same schema and renderHTML as the client version but no addNodeView
const ImageBlockServer = Node.create({
  name: 'imageBlock',
  group: 'block',
  draggable: true,
  atom: false,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      title: { default: '' },
      caption: { default: '' },
      alignment: { default: 'center' },
      width: { default: '100%' },
      dataImageId: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="imageBlock"]',
        getAttrs: (dom) => ({
          src: dom.querySelector('img')?.getAttribute('src'),
          alt: dom.querySelector('img')?.getAttribute('alt'),
          caption: dom.querySelector('figcaption')?.textContent || '',
          alignment: dom.getAttribute('data-alignment') || 'center',
          width: dom.querySelector('img')?.style?.width || '100%',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, alignment, width, dataImageId, ...rest } = HTMLAttributes;
    return [
      'figure',
      mergeAttributes(rest, {
        'data-type': 'imageBlock',
        'data-alignment': alignment,
        class: `image-block image-block-${alignment}`,
      }),
      ['img', { src, alt, style: `width: ${width}`, ...(dataImageId ? { 'data-image-id': dataImageId } : {}) }],
      caption ? ['figcaption', {}, caption] : ['figcaption', {}, ''],
    ];
  },
});

export function renderPostContent(content) {
  if (!content) return '';
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return generateHTML(doc, getBaseExtensions(ImageBlockServer));
  } catch (e) {
    console.error('Failed to render content:', e);
    return '';
  }
}
