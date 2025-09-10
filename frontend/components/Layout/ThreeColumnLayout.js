// components/Layout/ThreeColumnLayout.js
import React from 'react';
import { FaList } from 'react-icons/fa';
import TableOfContents from '../Shared/TableOfContents';
import { themeClasses } from '../../utils/themeClasses';

const ThreeColumnLayout = ({ 
  children, 
  content = '', 
  showTOC = true,
  leftSidebar = null,
  rightSidebar = null,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-medium-bg-primary ${className}`}>
      {/* Main Content - Using consistent Layout patterns */}
      <div className="py-6 lg:py-8">
        <div className={themeClasses.layout.container}>
          <div className={`flex flex-col lg:flex-row gap-6 lg:gap-8 ${leftSidebar ? '' : 'justify-center'}`}>
            {/* Left Sidebar - Optional */}
            {leftSidebar && (
              <aside className="order-last lg:order-first w-full lg:w-80 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-24">
                  <div className="lg:hidden mb-6">
                    {/* Mobile: Collapsed sidebar */}
                    <details className="bg-medium-bg-card rounded-card shadow-sm">
                      <summary className="p-4 cursor-pointer font-serif font-bold text-medium-text-primary">
                        Sidebar Content
                      </summary>
                      <div className="p-4">
                        {leftSidebar}
                      </div>
                    </details>
                  </div>
                  {/* Desktop: Full sidebar */}
                  <div className="hidden lg:block">
                    {leftSidebar}
                  </div>
                </div>
              </aside>
            )}
            
            {/* Main Content Area */}
            <main className="flex-1 min-w-0 order-first">
              <div className="space-y-6 lg:space-y-8">
                {/* Mobile TOC - Only show on mobile/tablet */}
                {showTOC && content && (
                  <div className="lg:hidden">
                    <div className="bg-medium-bg-card rounded-card p-4 shadow-sm">
                      <h3 className="font-serif font-bold text-medium-text-primary mb-md">
                        Table of Contents
                      </h3>
                      <TableOfContents content={content} renderOnlyList={true} />
                    </div>
                  </div>
                )}
                
                {/* Main Content */}
                {children}
              </div>
            </main>
            
            {/* Right Sidebar with TOC */}
            {(showTOC && content) || rightSidebar ? (
              <aside className="order-last w-full lg:w-80 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
                  {/* Desktop TOC */}
                  {showTOC && content && (
                    <div className="hidden lg:block bg-medium-bg-card rounded-card p-4 shadow-sm">
                      <h3 className="font-serif font-bold text-medium-text-primary mb-md">
                        Table of Contents
                      </h3>
                      <div className="custom-scrollbar max-h-[calc(100vh-12rem)] overflow-y-auto">
                        <TableOfContents 
                          content={content}
                          renderOnlyList={true}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Additional right sidebar content */}
                  {rightSidebar && (
                    <div className="hidden lg:block">
                      {rightSidebar}
                    </div>
                  )}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
