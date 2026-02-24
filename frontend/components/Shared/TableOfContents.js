// components/Shared/TableOfContents.js
import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TableOfContents = ({ content, className = '', collapsible = false }) => {
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(!collapsible);

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

  const minLevel = Math.min(...toc.map(t => t.level));

  const numberItems = () => {
    const counters = {};
    return toc.map(item => {
      const depth = item.level - minLevel;
      counters[depth] = (counters[depth] || 0) + 1;
      // Reset deeper counters
      Object.keys(counters).forEach(k => {
        if (parseInt(k) > depth) delete counters[k];
      });
      const num = Object.keys(counters)
        .sort((a, b) => a - b)
        .map(k => counters[k])
        .join('.');
      return { ...item, num };
    });
  };

  const numberedToc = numberItems();

  return (
    <nav className={`bg-white rounded-lg border border-medium-border ${className}`} aria-label="Mục lục">
      {/* Header */}
      <button
        onClick={() => collapsible && setIsOpen(prev => !prev)}
        className={`flex items-center justify-between w-full px-4 py-3 text-left ${
          collapsible ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <h4 className="font-serif font-bold text-sm text-medium-text-primary">
          Mục Lục
        </h4>
        {collapsible && (
          isOpen ? <FaChevronUp className="w-3 h-3 text-medium-text-muted" /> : <FaChevronDown className="w-3 h-3 text-medium-text-muted" />
        )}
      </button>

      {/* Items */}
      {isOpen && (
        <ul className="px-4 pb-4 space-y-0.5">
          {numberedToc.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className={`flex items-start gap-2 w-full text-left py-1.5 text-sm transition-colors rounded px-2 -mx-2 ${
                  activeId === item.id
                    ? 'text-medium-accent-green font-medium bg-medium-accent-green/5'
                    : 'text-medium-text-secondary hover:text-medium-text-primary'
                }`}
                style={{ paddingLeft: `${(item.level - minLevel) * 16 + 8}px` }}
              >
                <span className="text-medium-text-muted text-xs mt-0.5 flex-shrink-0 w-6 text-right">
                  {item.num}
                </span>
                <span className="line-clamp-2">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default TableOfContents;
