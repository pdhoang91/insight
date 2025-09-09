// components/Utils/AccessibilityProvider.js - Advanced accessibility utilities
import React, { createContext, useContext, useEffect, useState } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: false,
    screenReaderMode: false,
  });

  const [focusVisible, setFocusVisible] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Detect user preferences
  useEffect(() => {
    const mediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-reduced-data: reduce)'),
    };

    const updatePreferences = () => {
      setPreferences(prev => ({
        ...prev,
        reduceMotion: mediaQueries.reduceMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches,
      }));
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updatePreferences);
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setPreferences(prev => ({ ...prev, keyboardNavigation: true }));
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Screen reader detection
  useEffect(() => {
    const detectScreenReader = () => {
      // Basic screen reader detection
      const isScreenReader = window.navigator.userAgent.includes('NVDA') ||
                            window.navigator.userAgent.includes('JAWS') ||
                            window.speechSynthesis?.speaking ||
                            document.querySelector('[aria-live]');
      
      setPreferences(prev => ({ 
        ...prev, 
        screenReaderMode: !!isScreenReader 
      }));
    };

    detectScreenReader();
  }, []);

  // Announcement system for screen readers
  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    const announcement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 3000);
  };

  // Skip to content functionality
  const skipToContent = (targetId = 'main-content') => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Focus management
  const focusElement = (selector, options = {}) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus(options);
      return true;
    }
    return false;
  };

  // Trap focus within a container
  const trapFocus = (containerSelector) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        container.querySelector('[data-focus-return]')?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  const value = {
    preferences,
    focusVisible,
    announce,
    skipToContent,
    focusElement,
    trapFocus,
    setPreferences,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen reader announcements */}
      <div className="sr-only">
        {announcements.map(({ id, message, priority }) => (
          <div
            key={id}
            aria-live={priority}
            aria-atomic="true"
            role="status"
          >
            {message}
          </div>
        ))}
      </div>
      
      {/* Skip to content link */}
      <button
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-medium-accent-green text-white px-4 py-2 rounded-lg font-medium"
        onClick={() => skipToContent()}
        onFocus={(e) => e.target.classList.remove('sr-only')}
        onBlur={(e) => e.target.classList.add('sr-only')}
      >
        Skip to main content
      </button>
    </AccessibilityContext.Provider>
  );
};

// Accessibility utility hooks
export const useKeyboardNavigation = () => {
  const { preferences } = useAccessibility();
  return preferences.keyboardNavigation;
};

export const useReducedMotion = () => {
  const { preferences } = useAccessibility();
  return preferences.reduceMotion;
};

export const useScreenReader = () => {
  const { preferences } = useAccessibility();
  return preferences.screenReaderMode;
};

export const useAnnounce = () => {
  const { announce } = useAccessibility();
  return announce;
};

// Higher-order component for accessible components
export const withAccessibility = (WrappedComponent) => {
  return function AccessibleComponent(props) {
    const accessibility = useAccessibility();
    return <WrappedComponent {...props} accessibility={accessibility} />;
  };
};

export default AccessibilityProvider;
