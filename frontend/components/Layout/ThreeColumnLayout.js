// components/Layout/ThreeColumnLayout.js
import React from 'react';
import { FaList } from 'react-icons/fa';
import TableOfContents from '../Shared/TableOfContents';

const ThreeColumnLayout = ({ 
  children, 
  content = '', 
  showTOC = true,
  leftSidebar = null,
  rightSidebar = null,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-terminal-black ${className}`}>
      {/* Main Content - Using BlogSidebar pattern */}
      <div className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Optional */}
            {leftSidebar && (
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-16">
                  {leftSidebar}
                </div>
              </div>
            )}
            
            {/* Main Content Area */}
            <div className={`${leftSidebar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {/* Mobile TOC - Only show on mobile/tablet */}
              {showTOC && content && (
                <div className="lg:hidden mb-6">
                  <div className="bg-terminal-gray rounded-lg border border-terminal-border p-4">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                        MỤC LỤC
                      </h3>
                    </div>
                    <TableOfContents content={content} renderOnlyList={true} />
                  </div>
                </div>
              )}
              
              {/* Main Content */}
              {children}
            </div>
            
            {/* Right Sidebar - TOC (Desktop only) - Fixed position for reliable sticking */}
            {showTOC && content && (
              <div className="hidden lg:block lg:col-span-1">
                {/* Placeholder to maintain grid spacing */}
                <div className="w-full">
                  {/* Fixed TOC */}
                  <div className="toc-fixed-grid">
                    <div className="bg-terminal-gray rounded-lg border border-terminal-border p-4">
                      {/* Header */}
                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                          MỤC LỤC
                        </h3>
                      </div>

                      {/* TOC Content - Scrollable list */}
                      <div className="overflow-y-auto custom-scrollbar max-h-[calc(100vh-8rem)]">
                        <TableOfContents 
                          content={content}
                          renderOnlyList={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional right sidebar content (if provided) */}
            {rightSidebar && (
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-16">
                  {rightSidebar}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
