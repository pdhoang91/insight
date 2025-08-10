// components/Editor/Toolbar.js
import React from 'react';
import ToolbarButton from './ToolbarButton';

const Toolbar = ({ menuBar, editor, compact = false }) => {
  const essentialTools = ['bold', 'italic', 'heading', 'bulletList', 'orderedList', 'blockquote'];
  
  const filteredMenuBar = compact 
    ? menuBar.filter(item => essentialTools.includes(item.name) || item.essential)
    : menuBar;

  return (
    <div className={`sticky top-0 z-10 bg-surface/80 backdrop-blur-sm rounded-lg transition-all duration-300 ${
      compact ? 'p-2' : 'p-3'
    }`}>
      <div className="flex items-center justify-center">
        {/* Main Toolbar */}
        <div className={`flex items-center ${compact ? 'space-x-1' : 'space-x-2'} flex-wrap`}>
          {filteredMenuBar.map((item, index) => {
            if (item.children) {
              // Dropdown menu button
              return (
                <ToolbarButton
                  key={index}
                  icon={item.icon}
                  isActive={item.isActive ? item.isActive() : false}
                  tooltip={item.tooltip}
                  disabled={!editor}
                  compact={compact}
                >
                  {item.children}
                </ToolbarButton>
              );
            }

            // Single button
            return (
              <ToolbarButton
                key={index}
                icon={item.icon}
                onClick={item.action}
                isActive={item.isActive ? item.isActive() : false}
                tooltip={item.tooltip}
                disabled={!editor}
                compact={compact}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
