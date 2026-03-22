// Server-safe content renderer — no client-only extensions (no ReactNodeViewRenderer)
import { generateHTML } from '@tiptap/html';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

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

const getServerExtensions = () => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5] },
    codeBlock: false,
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
  Image,
  ImageBlockServer,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
  }),
  TextStyle,
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  Youtube.configure({ inline: false, HTMLAttributes: { class: 'youtube-embed' } }),
  Highlight.configure({ multicolor: true }),
  Color,
  Subscript,
  Superscript,
  TaskList,
  TaskItem.configure({ nested: true }),
  Typography,
];

export function renderPostContent(content) {
  if (!content) return '';
  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return generateHTML(doc, getServerExtensions());
  } catch (e) {
    console.error('Failed to render content:', e);
    return '';
  }
}
