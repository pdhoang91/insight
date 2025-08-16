// components/Layout/ThreeColumnLayout.js
import React from 'react';
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
      <div className="flex min-h-screen">
        {/* Left Sidebar - Optional */}
        {leftSidebar && (
          <div className="hidden lg:block w-1/4">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
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
        <div className="hidden lg:block w-1/4">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
            {showTOC && content && (
              <TableOfContents 
                content={content} 
                className=""
                isHorizontalLayout={true}
              />
            )}
            {rightSidebar}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
