// components/Editor/Toolbar.js
import React from 'react';
import ToolbarButton from './ToolbarButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Toolbar = ({ menuBar, editor, isPreview, setIsPreview, compact = false }) => {
  const essentialTools = ['bold', 'italic', 'heading', 'bulletList', 'orderedList', 'blockquote', 'focusMode'];
  
  const filteredMenuBar = compact 
    ? menuBar.filter(item => essentialTools.includes(item.name) || item.essential)
    : menuBar;

  return (
    <div className={`sticky top-0 z-10 bg-surface/80 backdrop-blur-sm rounded-lg transition-all duration-300 ${
      compact ? 'p-2' : 'p-3'
    }`}>
      <div className="flex items-center justify-between">
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

        {/* Preview Toggle */}
        <div className="flex items-center space-x-2">
          <div className={`h-4 w-px bg-border-primary ${compact ? 'mx-2' : 'mx-3'}`} />
          <ToolbarButton
            icon={isPreview ? FaEyeSlash : FaEye}
            onClick={() => setIsPreview(!isPreview)}
            isActive={isPreview}
            tooltip={isPreview ? 'Edit mode' : 'Preview mode'}
            disabled={!editor}
            compact={compact}
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
