// utils/tiptapExtensions.js — Client-side extensions (includes ImageBlock with ReactNodeViewRenderer)
// Do NOT import this in Server Components — use tiptapBaseExtensions.js instead.
import ImageBlock from '../components/Editor/extensions/ImageBlock'
import { getBaseExtensions } from './tiptapBaseExtensions'

export { getBaseExtensions }

export const getExtensions = () => getBaseExtensions(ImageBlock)
