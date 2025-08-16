// utils/tocGenerator.js

/**
 * Generate table of contents HTML from content
 * @param {string} content - HTML content to analyze
 * @returns {string} - TOC HTML
 */
export const generateTOCHTML = (content) => {
  if (!content) return '';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (headingElements.length === 0) {
    return '';
  }

  const headings = [];
  headingElements.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent.trim();
    const id = `heading-${index}-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
    
    // Add ID to heading if it doesn't exist
    heading.id = id;
    
    headings.push({
      id,
      text,
      level
    });
  });

  // Generate TOC HTML
  let tocHTML = '<div class="table-of-contents terminal-window mt-6 mb-8">';
  tocHTML += '<div class="p-4">';
  tocHTML += '<ul class="toc-list space-y-2">';

  headings.forEach((heading) => {
    const indentLevel = Math.max(0, heading.level - 1);
    const indentClass = indentLevel > 0 ? `ml-${indentLevel * 4}` : '';
    
    tocHTML += `
      <li class="toc-item ${indentClass}">
        <a href="#${heading.id}" 
           class="toc-link flex items-center gap-2 py-1 px-2 rounded text-sm transition-all duration-200 text-text-secondary hover:text-matrix-green hover:bg-terminal-gray/50 no-underline">
          ${indentLevel > 0 ? '<span class="text-xs opacity-60">▸</span>' : ''}
          <span>${heading.text}</span>
        </a>
      </li>
    `;
  });

  tocHTML += '</ul>';
  tocHTML += '</div>';
  tocHTML += '</div>';

  return {
    tocHTML,
    updatedContent: tempDiv.innerHTML
  };
};

/**
 * Insert TOC at the beginning of content
 * @param {string} content - Original content
 * @returns {object} - { content: string, tocHTML: string }
 */
export const insertTOCIntoContent = (content) => {
  if (!content) return { content: '', tocHTML: '' };

  const result = generateTOCHTML(content);
  if (!result.tocHTML) {
    return { content, tocHTML: '' };
  }

  // Insert TOC after the first paragraph or at the beginning
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = result.updatedContent;
  
  const firstParagraph = tempDiv.querySelector('p');
  
  if (firstParagraph) {
    // Insert after first paragraph
    const tocElement = document.createElement('div');
    tocElement.innerHTML = result.tocHTML;
    firstParagraph.insertAdjacentElement('afterend', tocElement.firstElementChild);
  } else {
    // Insert at the beginning
    const tocElement = document.createElement('div');
    tocElement.innerHTML = result.tocHTML;
    tempDiv.insertBefore(tocElement.firstElementChild, tempDiv.firstChild);
  }

  return {
    content: tempDiv.innerHTML,
    tocHTML: result.tocHTML
  };
};

/**
 * Remove existing TOC from content
 * @param {string} content - Content with TOC
 * @returns {string} - Content without TOC
 */
export const removeTOCFromContent = (content) => {
  if (!content) return '';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  // Remove existing TOC
  const existingTOC = tempDiv.querySelector('.table-of-contents');
  if (existingTOC) {
    existingTOC.remove();
  }

  return tempDiv.innerHTML;
};

/**
 * Check if content already has TOC
 * @param {string} content - Content to check
 * @returns {boolean}
 */
export const hasTOC = (content) => {
  if (!content) return false;
  return content.includes('table-of-contents');
};

/**
 * Extract headings from content for navigation
 * @param {string} content - HTML content
 * @returns {Array} - Array of heading objects
 */
export const extractHeadings = (content) => {
  if (!content) return [];

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headings = [];

  headingElements.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent.trim();
    const id = heading.id || `heading-${index}-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
    
    headings.push({
      id,
      text,
      level,
      tagName: heading.tagName
    });
  });

  return headings;
};
