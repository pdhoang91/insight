// components/Editor/ToolbarButton.js
import React, { useState, useRef, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';
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

  const buttonClasses = combineClasses(
    // Base styles với consistent sizing
    compact ? 'p-1' : 'p-1.5',
    themeClasses.effects.rounded,
    'flex items-center justify-center',
    themeClasses.interactive.base,
    themeClasses.interactive.touchTarget,
    
    // State-based styling với theme classes
    isActive 
      ? combineClasses(
          themeClasses.bg.accent,
          'text-white',
          themeClasses.effects.shadow,
          themeClasses.interactions.buttonPress
        )
      : combineClasses(
          themeClasses.text.secondary,
          themeClasses.text.accentHover,
          'hover:bg-medium-hover',
          themeClasses.interactions.buttonHoverSubtle
        ),
    
    // Disabled state
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  );

  if (children) {
    // Dropdown menu button
    return (
      <div className={themeClasses.utils.relative} ref={ref}>
        <Tippy content={tooltip} placement="top" disabled={compact}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={buttonClasses}
            aria-label={tooltip}
            title={tooltip}
          >
            <Icon className={compact ? themeClasses.icons.xs : themeClasses.icons.sm} />
          </button>
        </Tippy>
        {isOpen && (
          <div className={combineClasses(
            themeClasses.utils.absolute,
            'left-0 mt-2 w-48 z-20 overflow-hidden',
            themeClasses.bg.card,
            'border',
            themeClasses.border.primary,
            themeClasses.effects.rounded,
            themeClasses.effects.shadowLayeredLg
          )}>
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
        <Icon className={compact ? themeClasses.icons.xs : themeClasses.icons.sm} />
      </button>
    </Tippy>
  );
};

export default ToolbarButton;
