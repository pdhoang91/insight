// components/Editor/ToolbarButton.js
import React, { useState, useRef, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const ToolbarButton = ({ icon: Icon, onClick, isActive, tooltip, disabled, children, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonClasses = [
    compact ? 'p-1' : 'p-1.5',
    'rounded flex items-center justify-center transition-colors',
    isActive
      ? 'text-[#1a8917]'
      : 'text-[#757575] hover:text-[#292929]',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ].join(' ');

  const iconClass = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';

  if (children) {
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
            <Icon className={iconClass} />
          </button>
        </Tippy>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 z-20 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Tippy content={tooltip} placement="top" disabled={compact}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={buttonClasses}
        aria-label={tooltip}
        title={tooltip}
      >
        <Icon className={iconClass} />
      </button>
    </Tippy>
  );
};

export default ToolbarButton;
