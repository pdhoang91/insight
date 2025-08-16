// components/Shared/TableOfContents.js
import React, { useState, useEffect, useRef } from 'react';
import { FaList, FaTimes, FaChevronRight } from 'react-icons/fa';

const TableOfContents = ({ content, className = '', isHorizontalLayout = false }) => {
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const tocRef = useRef(null);
  const observerRef = useRef(null);

  // Extract headings from HTML content and add IDs to DOM elements
  useEffect(() => {
    if (!content) return;

    // Wait for DOM to be updated with the content
    setTimeout(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings = [];

      headingElements.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent.trim();
        const id = heading.id || `heading-${index}-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
        
        // Add ID to heading if it doesn't exist
        if (!heading.id) {
          heading.id = id;
        }
        
        extractedHeadings.push({
          id,
          text,
          level,
          element: heading
        });
      });

      setHeadings(extractedHeadings);
    }, 100);
  }, [content]);

  // Intersection Observer for active heading detection
  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
    
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Get the first visible heading
          const firstVisible = visibleEntries[0];
          setActiveHeading(firstVisible.target.id);
        }
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    headingElements.forEach(el => observer.observe(el));
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 100; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const generateTOC = () => {
    if (headings.length === 0) return null;

    return headings.map((heading) => {
      const isActive = activeHeading === heading.id;
      const indentLevel = Math.max(0, heading.level - 1);
      
      return (
        <li key={heading.id} className="mb-1">
          <button
            onClick={() => scrollToHeading(heading.id)}
            className={`
              w-full text-left py-2 px-0 text-sm transition-all duration-200
              hover:text-matrix-green
              ${isActive 
                ? 'text-matrix-green' 
                : 'text-text-secondary hover:text-matrix-green'
              }
            `}
            style={{ marginLeft: `${indentLevel * 16}px` }}
          >
            <span className="flex items-center gap-2">
              {indentLevel > 0 && <span className="text-xs opacity-60">▸</span>}
              <span className="truncate">{heading.text}</span>
            </span>
          </button>
        </li>
      );
    });
  };

  if (headings.length === 0) {
    return null;
  }

  // Horizontal layout (sidebar) version
  if (isHorizontalLayout) {
    return (
      <div className={`w-full ${className}`}>
        {/* TOC Sidebar Content */}
        <div className="bg-terminal-black">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-matrix-green font-mono flex items-center gap-2">
              <FaList className="w-4 h-4" />
              MỤC LỤC
            </h3>
          </div>

          {/* TOC Content */}
          <div className="overflow-y-auto custom-scrollbar max-h-[calc(100vh-8rem)]">
            <nav>
              <ul className="space-y-1">
                {generateTOC()}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    );
  }

  // Original floating version (for mobile)
  return (
    <>
      {/* TOC Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          fixed top-20 right-4 z-40 p-3 rounded-lg transition-all duration-300
          bg-terminal-gray/90 backdrop-blur-sm border border-matrix-green/30
          text-text-secondary hover:text-matrix-green hover:border-matrix-green
          shadow-lg hover:shadow-neon-green
          ${isVisible ? 'text-matrix-green border-matrix-green' : ''}
        `}
        title="Table of Contents"
      >
        <FaList className="w-4 h-4" />
      </button>

      {/* TOC Sidebar */}
      <div
        ref={tocRef}
        className={`
          fixed top-20 right-4 z-30 w-80 max-h-[calc(100vh-6rem)]
          bg-terminal-dark/95 backdrop-blur-sm border border-matrix-green/30 rounded-lg
          transform transition-all duration-300 shadow-xl
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-terminal-border">
          <h3 className="text-sm font-semibold text-matrix-green font-mono">
            MỤC LỤC
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-text-secondary hover:text-matrix-green transition-colors"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

        {/* TOC Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-10rem)]">
          <nav>
            <ul className="space-y-0">
              {generateTOC()}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-terminal-border text-xs text-text-muted text-center">
          {headings.length} mục
        </div>
      </div>

      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
};

export default TableOfContents;
