// components/Layout/Layout.js - Medium 2024 Design
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';

const Layout = ({ 
  children, 
  sidebar = null,
  maxWidth = 'container',
  showSidebar = true,
  className = '',
  ...props 
}) => {
  const containerClasses = {
    container: 'max-w-container',
    article: 'max-w-article',
    content: 'max-w-content',
    wide: 'max-w-wide',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen bg-medium-bg-primary">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-16" role="main" {...props}>
        <div className={`${containerClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 xl:px-12`}>
          {showSidebar && sidebar ? (
            /* Two Column Layout with Sidebar */
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 py-4 sm:py-6 lg:py-8">
              {/* Main Content Area - Always first, takes most space */}
              <main className="flex-1 min-w-0 order-first lg:max-w-none">
                <div className={`w-full ${className}`}>
                  {children}
                </div>
              </main>
              
              {/* Sidebar - Fixed width on desktop, full width on mobile */}
              <aside className="order-last w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  {/* Mobile: Show condensed sidebar */}
                  <div className="lg:hidden">
                    <MobileSidebarContent sidebar={sidebar} />
                  </div>
                  {/* Desktop: Show full sidebar */}
                  <div className="hidden lg:block">
                    {sidebar}
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            /* Single Column Layout */
            <div className={`py-4 sm:py-6 lg:py-8 ${className}`}>
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Mobile Sidebar Content - Condensed version for mobile
const MobileSidebarContent = ({ sidebar }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sidebar) return null;

  return (
    <div className="mt-8 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-medium-bg-card rounded-card text-medium-text-primary hover:bg-medium-hover transition-colors shadow-sm"
      >
        <span className="font-medium text-sm">More from this blog</span>
        {isExpanded ? (
          <FaChevronUp className="w-4 h-4 text-medium-text-muted" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-medium-text-muted" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
          {sidebar}
        </div>
      )}
    </div>
  );
};

// Specialized layouts for different page types
export const ArticleLayout = ({ children, ...props }) => (
  <Layout maxWidth="article" showSidebar={false} {...props}>
    <article className="prose prose-lg max-w-none reading-content">
      {children}
    </article>
  </Layout>
);

export const HomeLayout = ({ children, sidebar, ...props }) => (
  <Layout sidebar={sidebar} {...props}>
    {children}
  </Layout>
);

export const ProfileLayout = ({ children, ...props }) => (
  <Layout maxWidth="content" showSidebar={false} {...props}>
    {children}
  </Layout>
);

export default Layout;
