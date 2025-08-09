// components/Editor/ToolbarButton.js
import React, { useState, useRef, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const ToolbarButton = ({ icon: Icon, onClick, isActive, tooltip, disabled, children, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const buttonClasses = `
    ${compact ? 'p-1.5' : 'p-2'} 
    rounded-lg transition-all duration-200 
    ${isActive 
      ? 'bg-primary text-white shadow-sm' 
      : 'text-secondary hover:text-primary hover:bg-elevated/50'
    } 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    focus:outline-none focus:ring-2 focus:ring-primary/20
  `;

  if (children) {
    // Dropdown menu button
    return (
      <div className="relative" ref={ref}>
        <Tippy content={tooltip} placement="top" disabled={compact}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={buttonClasses}
            aria-label={tooltip}
            title={tooltip}
          >
            <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        </Tippy>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-surface border border-border-primary rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="py-1">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single button
  return (
    <Tippy content={tooltip} placement="top" disabled={compact}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={buttonClasses}
        aria-label={tooltip}
        title={tooltip}
      >
        <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
    </Tippy>
  );
};

export default ToolbarButton;
