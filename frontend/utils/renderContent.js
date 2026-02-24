// Renders post content (JSON document tree) to HTML
import { generateHTML } from '@tiptap/html';
import { getExtensions } from './tiptapExtensions';

/**
 * Converts post content (TipTap JSON document tree) to an HTML string.
 *
 * @param {object|string|null} content - The content field from the API response
 * @returns {string} HTML string ready for rendering
 */
export function renderPostContent(content) {
  if (!content) return '';

  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    return generateHTML(doc, getExtensions());
  } catch (e) {
    console.error('Failed to render content:', e);
    return '';
  }
}

/**
 * Extracts plain text from content for length calculations, previews, etc.
 */
export function getContentPlainText(content) {
  const html = renderPostContent(content);
  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  // SSR fallback: strip HTML tags
  return html.replace(/<[^>]*>/g, '');
}
