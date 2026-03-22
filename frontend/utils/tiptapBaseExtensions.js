// utils/tiptapBaseExtensions.js — Server-safe base extensions (no client-only ImageBlock)
// Import this in server-side renderers. tiptapExtensions.js wraps this for client use.
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Youtube from '@tiptap/extension-youtube'
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Typography from '@tiptap/extension-typography'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

/**
 * Returns all TipTap extensions with a swappable image-block extension.
 * @param {import('@tiptap/core').Extension} imageExtension
 *   Pass ImageBlock (client) from tiptapExtensions.js,
 *   or ImageBlockServer (server) from renderContentServer.js.
 */
export const getBaseExtensions = (imageExtension) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5] },
    codeBlock: false,
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
  Image,
  imageExtension,
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
]
