// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default to dark theme

  // Theme configuration
  const themes = {
    dark: {
      name: 'dark',
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        accent: '#f59e0b',
        danger: '#ef4444',
        
        bgApp: '#111827',
        bgSurface: '#1f2937',
        bgElevated: '#374151',
        bgContent: '#ffffff',
        
        textPrimary: '#f9fafb',
        textSecondary: '#d1d5db',
        textMuted: '#9ca3af',
        textContent: '#111827',
        textContentSecondary: '#4b5563',
        
        borderPrimary: '#374151',
        borderSecondary: '#4b5563',
        borderContent: '#e5e7eb',
      }
    },
    light: {
      name: 'light',
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        accent: '#f59e0b',
        danger: '#ef4444',
        
        bgApp: '#f9fafb',
        bgSurface: '#ffffff',
        bgElevated: '#f3f4f6',
        bgContent: '#ffffff',
        
        textPrimary: '#111827',
        textSecondary: '#4b5563',
        textMuted: '#6b7280',
        textContent: '#111827',
        textContentSecondary: '#4b5563',
        
        borderPrimary: '#e5e7eb',
        borderSecondary: '#d1d5db',
        borderContent: '#e5e7eb',
      }
    }
  };

  // Apply theme to CSS variables
  const applyTheme = (themeName) => {
    const selectedTheme = themes[themeName];
    const root = document.documentElement;
    
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Set specific theme
  const setSpecificTheme = (themeName) => {
    if (themes[themeName]) {
      setTheme(themeName);
      localStorage.setItem('theme', themeName);
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = {
    theme,
    themes,
    toggleTheme,
    setTheme: setSpecificTheme,
    currentTheme: themes[theme],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 