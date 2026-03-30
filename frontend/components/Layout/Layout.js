'use client';
// components/Layout/Layout.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Footer from './Footer';

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
  hideMobileSidebar = true,
  className = '',
  ...props
}) => {
  const containerVariants = {
    container: 'max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16',
    article: 'max-w-[720px] mx-auto px-4 sm:px-8 lg:px-16',
    reading: 'max-w-[860px] mx-auto px-4 sm:px-8 lg:px-16',
    wide: 'w-full px-4 sm:px-8 lg:px-16',
    compact: 'max-w-[640px] mx-auto px-4 sm:px-8 lg:px-16',
    full: 'w-full px-4 sm:px-8 lg:px-16',
  };

  const containerClass = containerVariants[variant] || containerVariants.container;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-[var(--text-inverse)] focus:rounded focus:font-display focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <main id="main-content" className="pt-16 relative flex-1" {...props}>
        <div className={containerClass}>
          {showSidebar && sidebar ? (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 py-6">
              <div className={`flex-1 min-w-0 ${className}`}>
                {children}
              </div>

              <aside className={`w-full lg:w-[280px] lg:flex-shrink-0 ${
                sidebarPosition === 'left' ? 'lg:order-first' : ''
              }`}>
                {/* Desktop: sticky scroll */}
                <div className="hidden lg:block">
                  <StickyDesktopSidebar>{sidebar}</StickyDesktopSidebar>
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
      <Footer />
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

export const HomeLayout = ({ children, sidebar, hideMobileSidebar, ...props }) => (
  <Layout variant="container" sidebar={sidebar} hideMobileSidebar={hideMobileSidebar} {...props}>
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
