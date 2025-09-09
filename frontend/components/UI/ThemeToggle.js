// components/UI/ThemeToggle.js
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { themeClasses } from '../../utils/themeClasses';

const ThemeToggle = ({ variant = 'simple', className = '' }) => {
  const { theme, isDark, isLight, toggleTheme, setLightTheme, setDarkTheme, mounted } = useTheme();

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-8 h-8 bg-medium-border rounded-lg"></div>
      </div>
    );
  }

  if (variant === 'simple') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-medium bg-medium-bg-secondary hover:bg-medium-hover transition-all duration-200 ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
        <FaSun className={`${themeClasses.icons.sm} ${themeClasses.text.accent}`} />
      ) : (
        <FaMoon className={`${themeClasses.icons.sm} ${themeClasses.text.accent}`} />
        )}
      </button>
    );
  }

  if (variant === 'toggle') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
      <FaSun className={`${themeClasses.icons.sm} transition-colors ${isLight ? themeClasses.text.accent : themeClasses.text.muted}`} />
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-medium-accent-green focus:ring-offset-2 ${
          isDark ? 'bg-medium-accent-green' : 'bg-medium-border'
        }`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-medium-bg-card transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <FaMoon className={`${themeClasses.icons.sm} transition-colors ${isDark ? themeClasses.text.accent : themeClasses.text.muted}`} />
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-body-small font-medium text-medium-text-secondary mb-2">
        Theme
      </div>
      
      <button
        onClick={setLightTheme}
        className={`w-full flex items-center px-3 py-2 text-body-small rounded-medium transition-colors ${
          isLight
            ? 'bg-medium-accent-green text-white'
            : 'text-medium-text-secondary hover:bg-medium-bg-secondary'
        }`}
      >
        <FaSun className={`${themeClasses.icons.sm} mr-3`} />
        Light Mode
      </button>
      
      <button
        onClick={setDarkTheme}
        className={`w-full flex items-center px-3 py-2 text-body-small rounded-medium transition-colors ${
          isDark
            ? 'bg-medium-accent-green text-white'
            : 'text-medium-text-secondary hover:bg-medium-bg-secondary'
        }`}
      >
        <FaMoon className={`${themeClasses.icons.sm} mr-3`} />
        Dark Mode
      </button>
    </div>
  );
};

export default ThemeToggle;
