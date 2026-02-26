'use client';
// components/Layout/Layout.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Medium-style sticky sidebar: sticks at top when short,
 * scrolls with page then sticks at bottom when tall.
 */
const useStickyScroll = (sidebarRef) => {
  const [stickyStyle, setStickyStyle] = useState({});
  const lastScrollY = useRef(0);
  const stickyTop = useRef(80);

  const update = useCallback(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const sidebarHeight = el.offsetHeight;
    const viewportHeight = window.innerHeight;
    const navOffset = 80;

    if (sidebarHeight <= viewportHeight - navOffset) {
      // Sidebar fits in viewport — simple sticky top
      setStickyStyle({ position: 'sticky', top: navOffset });
      return;
    }

    // Sidebar taller than viewport — sticky-bottom behavior
    const scrollY = window.scrollY;
    const scrollingDown = scrollY > lastScrollY.current;
    lastScrollY.current = scrollY;

    if (scrollingDown) {
      // Scrolling down: stick when bottom of sidebar reaches viewport bottom
      const topVal = viewportHeight - sidebarHeight;
      setStickyStyle({ position: 'sticky', top: Math.min(topVal, navOffset) });
    } else {
      // Scrolling up: stick at top
      setStickyStyle({ position: 'sticky', top: navOffset });
    }
  }, [sidebarRef]);

  useEffect(() => {
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  return stickyStyle;
};

const StickyDesktopSidebar = ({ children }) => {
  const ref = useRef(null);
  const style = useStickyScroll(ref);

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
};

const Layout = ({
  children,
  sidebar = null,
  variant = 'container',
  showSidebar = true,
  sidebarPosition = 'right',
  className = '',
  ...props
}) => {
  const containerVariants = {
    container: 'max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8',
    article: 'max-w-[680px] mx-auto px-4 md:px-6',
    reading: 'max-w-[800px] mx-auto px-4 md:px-6',
    wide: 'max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8',
    compact: 'max-w-[600px] mx-auto px-4 md:px-6',
    full: 'w-full px-4 md:px-6 lg:px-8',
  };

  const containerClass = containerVariants[variant] || containerVariants.container;

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-16 relative" role="main" {...props}>
        <div className={containerClass}>
          {showSidebar && sidebar ? (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 py-8">
              <div className={`flex-1 min-w-0 ${className}`}>
                {children}
              </div>

              <aside className={`w-full lg:w-[300px] lg:flex-shrink-0 ${
                sidebarPosition === 'left' ? 'lg:order-first' : ''
              }`}>
                {/* Desktop: sticky scroll */}
                <div className="hidden lg:block">
                  <StickyDesktopSidebar>{sidebar}</StickyDesktopSidebar>
                </div>
                {/* Mobile: collapsible */}
                <div className="block lg:hidden">
                  <MobileSidebarContent sidebar={sidebar} />
                </div>
              </aside>
            </div>
          ) : (
            <div className={`py-8 ${className}`}>
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MobileSidebarContent = ({ sidebar }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sidebar) return null;

  return (
    <div className="mt-8 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 border-t border-[#f2f2f2] text-[#292929] transition-colors"
        aria-expanded={isExpanded}
        aria-controls="mobile-sidebar-content"
      >
        <span className="font-serif font-bold text-sm">More from this blog</span>
        {isExpanded ? (
          <FaChevronUp className="w-3.5 h-3.5 text-[#757575]" />
        ) : (
          <FaChevronDown className="w-3.5 h-3.5 text-[#757575]" />
        )}
      </button>

      {isExpanded && (
        <div
          id="mobile-sidebar-content"
          className="mt-4 max-h-[400px] overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {sidebar}
        </div>
      )}
    </div>
  );
};

export const ArticleLayout = ({ children, ...props }) => (
  <Layout variant="reading" showSidebar={false} {...props}>
    <article className="prose prose-lg max-w-none">
      {children}
    </article>
  </Layout>
);

export const HomeLayout = ({ children, sidebar, ...props }) => (
  <Layout variant="container" sidebar={sidebar} {...props}>
    {children}
  </Layout>
);

export const ProfileLayout = ({ children, ...props }) => (
  <Layout variant="container" showSidebar={false} {...props}>
    {children}
  </Layout>
);

export const ReadingLayout = ({ children, sidebar, ...props }) => (
  <Layout variant="container" sidebar={sidebar} sidebarPosition="right" {...props}>
    {children}
  </Layout>
);

export const WriteLayout = ({ children, ...props }) => (
  <Layout variant="container" showSidebar={false} {...props}>
    {children}
  </Layout>
);

export default Layout;
