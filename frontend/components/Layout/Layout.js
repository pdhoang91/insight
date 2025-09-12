// components/Layout/Layout.js - Unified Responsive Layout
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const Layout = ({ 
  children, 
  sidebar = null,
  variant = 'container', // 'container', 'article', 'reading', 'wide', 'compact', 'full'
  showSidebar = true,
  sidebarPosition = 'right', // 'right', 'left'
  className = '',
  ...props 
}) => {
  // Container variants - minimal mobile padding, heavy desktop padding
  const containerVariants = {
    container: themeClasses.layout.container,
    article: themeClasses.layout.article,
    reading: themeClasses.layout.reading,
    wide: themeClasses.layout.containerWide,
    compact: themeClasses.layout.containerSmall,
    full: 'w-full px-3 md:px-4 lg:px-8 xl:px-20 2xl:px-32',
  };

  const containerClass = containerVariants[variant] || containerVariants.container;

  return (
    <div className={combineClasses(themeClasses.layout.fullHeight, themeClasses.bg.primary)}>
      {/* Main Content */}
      <main className="pt-16 md:pt-20" role="main" {...props}>
        <div className={containerClass}>
          {showSidebar && sidebar ? (
            /* Layout with Sidebar - Enhanced responsive behavior */
            <div className={combineClasses('flex flex-col lg:flex-row', themeClasses.spacing.gap, themeClasses.spacing.section)}>
              {/* Main Content Area - Always first on mobile */}
              <div className="flex-1 min-w-0 order-first">
                <div className={combineClasses('space-y-4 lg:space-y-6 xl:space-y-5', className)}>
                  {children}
                </div>
              </div>
              
              {/* Sidebar - Increased width by 30% */}
              <aside className={combineClasses(
                'order-last w-full lg:w-96 xl:w-80 2xl:w-72 lg:flex-shrink-0',
                sidebarPosition === 'left' ? 'lg:order-first' : ''
              )}>
                <div className="lg:sticky lg:top-24 xl:top-20">
                  {/* Mobile: Condensed sidebar */}
                  <div className="lg:hidden">
                    <MobileSidebarContent sidebar={sidebar} />
                  </div>
                  {/* Desktop: Full sidebar */}
                  <div className="hidden lg:block">
                    {sidebar}
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            /* Single Column Layout - Enhanced spacing */
            <div className={combineClasses(themeClasses.spacing.section, className)}>
              <div className="space-y-4 lg:space-y-6 xl:space-y-5">
                {children}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Mobile Sidebar Content - Touch-friendly responsive version
const MobileSidebarContent = ({ sidebar }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sidebar) return null;

  return (
    <div className="mt-6 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={combineClasses(
          'w-full flex items-center justify-between',
          'p-4 rounded-card shadow-sm',
          'text-medium-text-primary hover:bg-medium-hover',
          'transition-all duration-200 min-h-[44px]', // Touch-friendly height
          'focus:ring-2 focus:ring-medium-accent-green focus:outline-none'
        )}
        aria-expanded={isExpanded}
        aria-controls="mobile-sidebar-content"
      >
        <span className="font-serif font-bold text-body-small">More from this blog</span>
        {isExpanded ? (
          <FaChevronUp className="w-4 h-4 text-medium-text-muted transition-transform" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-medium-text-muted transition-transform" />
        )}
      </button>
      
      {isExpanded && (
        <div 
          id="mobile-sidebar-content"
          className="mt-3 space-y-3 max-h-96 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {sidebar}
        </div>
      )}
    </div>
  );
};

// Specialized layouts for different page types with enhanced responsive optimization
export const ArticleLayout = ({ children, ...props }) => (
  <Layout variant="reading" showSidebar={false} {...props}>
    <article className="prose prose-lg max-w-none reading-content">
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
