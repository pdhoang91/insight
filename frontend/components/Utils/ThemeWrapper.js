// components/Utils/ThemeWrapper.js
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeWrapper component that provides theme-aware styling
 * Automatically applies theme classes and provides theme utilities
 */
const ThemeWrapper = ({ 
  children, 
  className = '', 
  as: Component = 'div',
  ...props 
}) => {
  const { theme, isDark, isLight, mounted } = useTheme();

  // Don't apply theme classes until mounted
  if (!mounted) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    );
  }

  const themeClasses = `
    ${isDark ? 'dark' : 'light'}
    bg-medium-bg-primary 
    text-medium-text-primary
    transition-colors 
    duration-200
  `.trim();

  return (
    <Component 
      className={`${themeClasses} ${className}`}
      data-theme={theme}
      {...props}
    >
      {children}
    </Component>
  );
};

// Note: useThemeClasses has been moved to hooks/useThemeClasses.js for better organization
// Import from there instead: import { useThemeClasses } from '../../hooks/useThemeClasses';

/**
 * Component for theme-aware cards
 */
export const ThemeCard = ({ children, className = '', ...props }) => {
  const cardClasses = ' border border-medium-border rounded-lg';
  
  return (
    <div className={`${cardClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Component for theme-aware buttons
 */
export const ThemeButton = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const { isDark } = useTheme();
  
  const variants = {
    primary: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90',
    secondary: ' text-medium-text-primary hover:bg-medium-divider',
    outline: 'border border-medium-border text-medium-text-primary hover:',
    ghost: 'text-medium-text-secondary hover:text-medium-text-primary hover:',
  };

  return (
    <button 
      className={`
        px-4 py-2 rounded-md font-medium transition-colors duration-200
        ${variants[variant]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default ThemeWrapper;
