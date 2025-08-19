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
          <div className={`grid grid-cols-1 gap-6 ${leftSidebar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'}`} style={{overflow: 'visible'}}>
            {/* Left Sidebar - Optional */}
            {leftSidebar && (
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-16">
                  {leftSidebar}
                </div>
              </div>
            )}
            
            {/* Main Content Area */}
            <div className={`${leftSidebar ? 'lg:col-span-3' : 'w-full'} ${showTOC && content ? 'lg:pr-80' : ''}`}>
              {/* Mobile TOC - Only show on mobile/tablet */}
              {showTOC && content && (
                <div className="lg:hidden mb-6">
                  <div className="rounded-lg p-4">
                    <div className="mb-3">
                    </div>
                    <TableOfContents content={content} renderOnlyList={true} />
                  </div>
                </div>
              )}
              
              {/* Main Content */}
              {children}
            </div>
            
            {/* Fixed TOC - Positioned outside grid */}
            {showTOC && content && (
              <div className="toc-fixed-grid">
                <div className="rounded-lg p-4 shadow-lg shadow-matrix-green/20">
                  {/* TOC Content - Scrollable list */}
                  <div className="custom-scrollbar max-h-[calc(100vh-10rem)] overflow-y-auto">
                    <TableOfContents 
                      content={content}
                      renderOnlyList={true}
                    />
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
