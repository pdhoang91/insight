// components/Shared/TableOfContents.js
import React, { useState, useEffect } from 'react';

const TableOfContents = ({ content, className = '' }) => {
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');

    const tocItems = Array.from(headings).map((heading, index) => {
      const id = heading.id || `heading-${index}`;
      return {
        id,
        text: heading.textContent.trim(),
        level: parseInt(heading.tagName.charAt(1)),
      };
    });

    setToc(tocItems);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headings = toc
        .map(item => {
          const el = document.getElementById(item.id);
          return el ? { id: item.id, top: el.getBoundingClientRect().top } : null;
        })
        .filter(Boolean);

      const current = headings.find((h, i) => {
        const next = headings[i + 1];
        return h.top <= 100 && (!next || next.top > 100);
      });

      if (current) setActiveId(current.id);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (toc.length === 0) return null;

  return (
    <nav className={`${className}`} aria-label="Table of contents">
      <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-medium-text-muted mb-3">
        On this page
      </h4>
      <ul className="space-y-1 border-l border-medium-border">
        {toc.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollTo(item.id)}
              className={`block w-full text-left text-sm py-1 transition-colors border-l-2 -ml-px ${
                activeId === item.id
                  ? 'border-medium-accent-green text-medium-accent-green font-medium'
                  : 'border-transparent text-medium-text-secondary hover:text-medium-text-primary hover:border-medium-border'
              }`}
              style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
