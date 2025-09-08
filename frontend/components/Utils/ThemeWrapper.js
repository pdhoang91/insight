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

/**
 * Hook to get theme-aware class names
 */
export const useThemeClasses = () => {
  const { isDark, isLight } = useTheme();

  return {
    // Background classes
    bgPrimary: 'bg-medium-bg-primary',
    bgSecondary: 'bg-medium-bg-secondary', 
    bgCard: 'bg-medium-bg-card',
    
    // Text classes
    textPrimary: 'text-medium-text-primary',
    textSecondary: 'text-medium-text-secondary',
    textMuted: 'text-medium-text-muted',
    
    // Border classes
    border: 'border-medium-border',
    divider: 'border-medium-divider',
    
    // Accent classes
    accent: 'text-medium-accent-green',
    accentBg: 'bg-medium-accent-green',
    
    // Utility classes
    card: 'bg-medium-bg-card border border-medium-border rounded-lg',
    button: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 transition-colors',
    input: 'bg-medium-bg-secondary border border-medium-border text-medium-text-primary',
    
    // Theme state
    isDark,
    isLight,
  };
};

/**
 * Component for theme-aware cards
 */
export const ThemeCard = ({ children, className = '', ...props }) => {
  const { card } = useThemeClasses();
  
  return (
    <div className={`${card} ${className}`} {...props}>
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
    secondary: 'bg-medium-bg-secondary text-medium-text-primary hover:bg-medium-divider',
    outline: 'border border-medium-border text-medium-text-primary hover:bg-medium-bg-secondary',
    ghost: 'text-medium-text-secondary hover:text-medium-text-primary hover:bg-medium-bg-secondary',
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
