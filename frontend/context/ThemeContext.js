// context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // During SSR, provide default values instead of throwing error
    if (typeof window === 'undefined') {
      return {
        theme: 'light',
        isDark: false,
        isLight: true,
        toggleTheme: () => {},
        setLightTheme: () => {},
        setDarkTheme: () => {},
        mounted: false
      };
    }
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      } else {
        // Default to system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
      }
    } catch (error) {
      // Fallback for SSR or localStorage issues
      setTheme('light');
    }
    
    setMounted(true);
  }, []);

  // Apply theme to document with optimized performance
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        // Use requestAnimationFrame for smooth transition
        requestAnimationFrame(() => {
          document.documentElement.setAttribute('data-theme', theme);
          document.documentElement.className = theme; // Also add as class for compatibility
          localStorage.setItem('theme', theme);
        });
      } catch (error) {
        console.warn('Failed to apply theme:', error);
      }
    }
  }, [theme, mounted]);

  // Listen for system theme changes (only if user hasn't manually set a theme)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.warn('Failed to setup media query listener:', error);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setLightTheme = () => {
    setTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
  };

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const value = {
    theme,
    isDark,
    isLight,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    mounted
  };

  // For SSR compatibility, always render children but hide until mounted
  return (
    <ThemeContext.Provider value={value}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
