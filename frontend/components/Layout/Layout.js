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
    full: combineClasses('w-full', themeClasses.spacing.container),
  };

  const containerClass = containerVariants[variant] || containerVariants.container;


  return (
    <div className={combineClasses(themeClasses.layout.fullHeight, themeClasses.bg.primary)}>
      <main className={combineClasses('pt-16', themeClasses.utils.relative)} role="main" {...props}>
        <div className={containerClass}>
          {showSidebar && sidebar ? (
            <div className={combineClasses(
              'flex flex-col lg:flex-row gap-6 lg:gap-8',
              'py-6 lg:py-8'
            )}>
              <div className={combineClasses('flex-1 min-w-0', className)}>
                {children}
              </div>

              <aside className={combineClasses(
                'w-full lg:w-[300px] lg:flex-shrink-0',
                sidebarPosition === 'left' ? 'lg:order-first' : ''
              )}>
                <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
                  <div className="block lg:hidden">
                    <MobileSidebarContent sidebar={sidebar} />
                  </div>
                  <div className="hidden lg:block">
                    {sidebar}
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className={combineClasses('py-6 lg:py-8', className)}>
              {children}
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
    <div className={combineClasses('mt-6 mb-4')}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={combineClasses(
          'w-full flex items-center justify-between p-4',
          themeClasses.effects.rounded,
          themeClasses.effects.shadow,
          themeClasses.text.primary,
          'hover:text-medium-accent-green',
          themeClasses.animations.smooth,
          themeClasses.interactive.touchTarget,
          themeClasses.focus.ring
        )}
        aria-expanded={isExpanded}
        aria-controls="mobile-sidebar-content"
      >
        <span className={combineClasses(
          themeClasses.typography.serif,
          themeClasses.typography.weightBold,
          themeClasses.text.bodySmall
        )}>More from this blog</span>
        {isExpanded ? (
          <FaChevronUp className={combineClasses(
            themeClasses.icons.sm,
            themeClasses.text.muted,
            'transition-transform'
          )} />
        ) : (
          <FaChevronDown className={combineClasses(
            themeClasses.icons.sm,
            themeClasses.text.muted,
            'transition-transform'
          )} />
        )}
      </button>
      
      {isExpanded && (
        <div 
          id="mobile-sidebar-content"
          className={combineClasses(
            'mt-3 max-h-96 overflow-y-auto overscroll-contain',
            themeClasses.spacing.stackSmall
          )}
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
    <article className={combineClasses(
      themeClasses.prose.large,
      'max-w-none reading-content'
    )}>
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
