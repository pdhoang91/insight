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
      <div className="flex">
        {/* Left Sidebar - Optional */}
        {leftSidebar && (
          <div className="hidden lg:block w-1/4">
            <div className="sticky !top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4" style={{ top: '4rem' }}>
              {leftSidebar}
            </div>
          </div>
        )}
        
        {/* Main Content - Center */}
        <div className={`w-full ${leftSidebar ? 'lg:w-1/2' : 'lg:w-3/4'} flex-1`}>
          {/* Mobile TOC - Only show on mobile */}
          {showTOC && content && (
            <div className="lg:hidden">
              <TableOfContents content={content} />
            </div>
          )}
          
          {/* Main Content */}
          <div className="content-with-toc">
            {children}
          </div>
        </div>
        
        {/* Right Sidebar - TOC */}
        <div className="hidden lg:block w-1/4 relative">
          {/* TOC - Fixed to viewport (always visible when scrolling) */}
          {showTOC && content && (
            <div className="toc-fixed-sidebar">
              <div className="bg-terminal-black/30 backdrop-blur-sm rounded-lg p-4">
                {/* Header */}
                <div className="mb-4 pb-3">
                  <h3 className="text-sm font-semibold text-matrix-green font-mono flex items-center gap-2">
                    <FaList className="w-4 h-4" />
                    MỤC LỤC
                  </h3>
                </div>

                {/* TOC Content - Scrollable list */}
                <div className="overflow-y-auto custom-scrollbar max-h-[calc(100vh-16rem)]">
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
            <div className="toc-fixed-sidebar" style={{ top: 'calc(4rem + 300px)' }}>
              {rightSidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
