// components/Layout/Layout.js - Unified Responsive Layout
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const Layout = ({ 
  children, 
  sidebar = null,
  variant = 'container', // 'container', 'article', 'wide', 'full'
  showSidebar = true,
  sidebarPosition = 'right', // 'right', 'left'
  className = '',
  ...props 
}) => {
  // Container variants using our standardized layout patterns
  const containerVariants = {
    container: themeClasses.layout.container,
    article: themeClasses.layout.article,
    reading: themeClasses.layout.reading,
    wide: themeClasses.layout.containerWide,
    full: 'w-full px-lg md:px-xl lg:px-2xl',
  };

  const containerClass = containerVariants[variant] || containerVariants.container;

  return (
    <div className={combineClasses(themeClasses.layout.fullHeight, themeClasses.bg.primary)}>
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-16 md:pt-20" role="main" {...props}>
        <div className={containerClass}>
          {showSidebar && sidebar ? (
            /* Layout with Sidebar - Mobile-first responsive */
            <div className={combineClasses('flex flex-col lg:flex-row gap-lg lg:gap-xl', themeClasses.spacing.section)}>
              {/* Main Content Area - Always first on mobile */}
              <div className="flex-1 min-w-0 order-first">
                <div className={combineClasses('space-y-lg lg:space-y-xl', className)}>
                  {children}
                </div>
              </div>
              
              {/* Sidebar - Responsive positioning */}
              <aside className={combineClasses(
                'order-last w-full lg:w-80 lg:flex-shrink-0',
                sidebarPosition === 'left' ? 'lg:order-first lg:mr-xl' : ''
              )}>
                <div className="lg:sticky lg:top-24">
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
            /* Single Column Layout */
            <div className={combineClasses(themeClasses.spacing.section, className)}>
              <div className="space-y-lg lg:space-y-xl">
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
    <div className="mt-xl mb-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={combineClasses(
          'w-full flex items-center justify-between',
          'p-lg bg-medium-bg-card border border-medium-border rounded-card',
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
          className="mt-md space-y-md max-h-96 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {sidebar}
        </div>
      )}
    </div>
  );
};

// Specialized layouts for different page types with responsive optimization
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
  <Layout variant="wide" showSidebar={false} {...props}>
    {children}
  </Layout>
);

export const ReadingLayout = ({ children, sidebar, ...props }) => (
  <Layout variant="reading" sidebar={sidebar} sidebarPosition="right" {...props}>
    {children}
  </Layout>
);

export default Layout;
