// hooks/useThemeClasses.js - Consolidated theme utilities
import { useTheme } from '../context/ThemeContext';
import { themeClasses, componentClasses, combineClasses } from '../utils/themeClasses';

export const useThemeClasses = () => {
  const { theme, isDark, isLight } = useTheme();

  // Dynamic classes based on theme
  const getDynamicClass = (baseClass, darkVariant, lightVariant) => {
    if (!darkVariant && !lightVariant) return baseClass;
    
    if (isDark && darkVariant) {
      return combineClasses(baseClass, darkVariant);
    }
    
    if (isLight && lightVariant) {
      return combineClasses(baseClass, lightVariant);
    }
    
    return baseClass;
  };

  // Common component classes with theme awareness
  const classes = {
    // Page layouts
    page: componentClasses.page,
    pageLoading: componentClasses.pageLoading,
    pageError: componentClasses.pageError,
    
    // Navigation
    navbar: componentClasses.navbar,
    
    // Cards and containers
    card: componentClasses.postCard,
    cardHover: combineClasses(componentClasses.postCard, 'hover:shadow-md'),
    
    // Buttons
    button: componentClasses.button,
    
    // Forms
    input: componentClasses.input,
    textarea: componentClasses.textarea,
    
    // Typography
    heading: componentClasses.heading,
    
    // States
    loading: themeClasses.patterns.loadingState,
    error: themeClasses.patterns.errorState,
    empty: themeClasses.patterns.emptyState,
    skeleton: themeClasses.patterns.skeleton,
    
    // Interactive elements
    avatar: themeClasses.patterns.avatar,
    tag: themeClasses.patterns.tag,
    
    // Layout helpers
    container: themeClasses.layout.container,
    article: themeClasses.layout.article,
    sticky: themeClasses.layout.sticky,
    
    // Spacing
    section: themeClasses.spacing.section,
    gap: themeClasses.spacing.gap,
    
    // Theme-specific utilities
    bg: themeClasses.bg,
    text: themeClasses.text,
    border: themeClasses.border,
    
    // Simple class utilities (compatible with ThemeWrapper version)
    bgPrimary: 'bg-medium-bg-primary',
    bgSecondary: '', 
    bgCard: '',
    textPrimary: 'text-medium-text-primary',
    textSecondary: 'text-medium-text-secondary',
    textMuted: 'text-medium-text-muted',
    border: 'border-medium-border',
    divider: 'border-medium-divider',
    accent: 'text-medium-accent-green',
    accentBg: 'bg-medium-accent-green',
  };

  return {
    classes,
    theme,
    isDark,
    isLight,
    getDynamicClass,
    combineClasses,
    
    // Legacy support for ThemeWrapper usage
    bgPrimary: 'bg-medium-bg-primary',
    bgSecondary: '', 
    bgCard: '',
    textPrimary: 'text-medium-text-primary',
    textSecondary: 'text-medium-text-secondary',
    textMuted: 'text-medium-text-muted',
    border: 'border-medium-border',
    divider: 'border-medium-divider',
    accent: 'text-medium-accent-green',
    accentBg: 'bg-medium-accent-green',
    card: 'border border-medium-border rounded-lg',
    button: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 transition-colors',
    input: ' border border-medium-border text-medium-text-primary',
  };
};

export default useThemeClasses;
