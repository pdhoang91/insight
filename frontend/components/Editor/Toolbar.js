// components/Editor/Toolbar.js
import React from 'react';
import ToolbarButton from './ToolbarButton';

const Toolbar = ({ menuBar, editor, isPreview, setIsPreview }) => {
  return (
    <div className="sticky top-0 z-10 bg-white p-2 flex items-center space-x-2">
      {menuBar.map((item, index) => {
        if (item.children) {
          // Nếu nút có dropdown menu
          return (
            <ToolbarButton
              key={index}
              icon={item.icon}
              isActive={item.isActive ? item.isActive() : false}
              tooltip={item.tooltip}
              disabled={!editor}
            >
              {item.children}
            </ToolbarButton>
          );
        }

        // Nút đơn
        return (
          <ToolbarButton
            key={index}
            icon={item.icon}
            onClick={item.action}
            isActive={item.isActive ? item.isActive() : false}
            tooltip={item.tooltip}
            disabled={!editor}
          />
        );
      })}
    </div>
  );
};

export default Toolbar;
