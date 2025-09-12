// components/Shared/TableOfContents.js
import React, { useState, useEffect } from 'react';
import { FaList, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const TableOfContents = ({ content, className = '' }) => {
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract headings from HTML content
  useEffect(() => {
    if (!content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const tocItems = Array.from(headings).map((heading, index) => {
      const id = heading.id || `heading-${index}`;
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = id;
      }
      
      return {
        id,
        text,
        level,
        element: heading
      };
    });

    setToc(tocItems);
  }, [content]);

  // Handle scroll to update active heading
  useEffect(() => {
    const handleScroll = () => {
      const headings = toc.map(item => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return {
            id: item.id,
            top: rect.top,
            element
          };
        }
        return null;
      }).filter(Boolean);

      // Find the heading that's currently in view
      const current = headings.find((heading, index) => {
        const next = headings[index + 1];
        return heading.top <= 100 && (!next || next.top > 100);
      });

      if (current) {
        setActiveId(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial active heading

    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Account for fixed navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (toc.length === 0) return null;

  return (
    <div className={`table-of-contents ${className}`}>
      {/* Header */}
      <div className="toc-header">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={!isCollapsed}
          aria-controls="toc-list"
          aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} table of contents`}
        >
          <div className="flex items-center gap-2">
            <span>Table of Contents</span>
          </div>
          {isCollapsed ? (
            <FaChevronDown className="w-4 h-4" aria-hidden="true" />
          ) : (
            <FaChevronUp className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* TOC List */}
      {!isCollapsed && (
        <ul className="toc-list p-4" id="toc-list" role="navigation" aria-label="Table of contents">
          {toc.map((item, index) => (
            <li key={index} className="toc-item">
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`toc-link ${activeId === item.id ? 'active' : ''}`}
                style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
                aria-label={`Navigate to section: ${item.text}`}
                aria-current={activeId === item.id ? 'location' : undefined}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TableOfContents;