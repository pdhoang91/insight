// utils/themeClasses.js
// Centralized theme class utilities to avoid hardcoding

export const themeClasses = {
  // Background colors
  bg: {
    primary: 'bg-medium-bg-primary',
    secondary: 'bg-medium-bg-secondary', 
    card: 'bg-medium-bg-card',
    accent: 'bg-medium-accent-green',
    accentHover: 'hover:bg-medium-accent-green',
    accentLight: 'bg-medium-accent-green/20',
  },

  // Text colors
  text: {
    primary: 'text-medium-text-primary',
    secondary: 'text-medium-text-secondary',
    muted: 'text-medium-text-muted',
    accent: 'text-medium-accent-green',
    accentHover: 'hover:text-medium-accent-green',
    white: 'text-white',
    error: 'text-red-500',
    success: 'text-green-500',
  },

  // Border colors
  border: {
    primary: 'border-medium-border',
    accent: 'border-medium-accent-green',
    accentLight: 'border-medium-accent-green/40',
    transparent: 'border-transparent',
  },

  // Typography
  typography: {
    serif: 'font-serif',
    bold: 'font-bold',
    medium: 'font-medium',
    semibold: 'font-semibold',
    heading: 'font-serif font-bold',
    body: 'font-sans',
  },

  // Layout
  layout: {
    container: 'max-w-container mx-auto px-6 sm:px-8 lg:px-12',
    article: 'max-w-article mx-auto',
    fullHeight: 'min-h-screen',
    sticky: 'sticky top-20',
  },

  // Interactive states
  interactive: {
    button: 'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-medium-accent-green/50',
    buttonPrimary: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90',
    buttonSecondary: 'bg-medium-bg-secondary text-medium-text-primary hover:bg-medium-bg-primary',
    buttonGhost: 'text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-bg-secondary',
    input: 'bg-medium-bg-secondary border-medium-border text-medium-text-primary placeholder-medium-text-muted focus:border-medium-accent-green focus:ring-2 focus:ring-medium-accent-green/50',
    card: 'bg-medium-bg-card border-medium-border hover:border-medium-accent-green/40 transition-colors duration-300',
  },

  // Common patterns
  patterns: {
    loadingState: 'bg-medium-bg-primary flex items-center justify-center',
    errorState: 'bg-medium-bg-primary text-center',
    emptyState: 'bg-medium-bg-primary text-center py-12',
    skeleton: 'bg-medium-bg-secondary animate-pulse',
    avatar: 'bg-medium-bg-secondary border-medium-border rounded-full flex items-center justify-center',
    tag: 'bg-medium-bg-secondary text-medium-text-secondary px-3 py-1 rounded-full text-sm',
  },

  // Spacing
  spacing: {
    section: 'py-12',
    card: 'p-6',
    cardSmall: 'p-4',
    cardLarge: 'p-8',
    gap: 'gap-6',
    gapSmall: 'gap-4',
    gapLarge: 'gap-8',
  },

  // Shadows and effects
  effects: {
    shadow: 'shadow-sm',
    shadowLarge: 'shadow-lg',
    rounded: 'rounded-lg',
    roundedFull: 'rounded-full',
    blur: 'backdrop-blur-md',
  },
};

// Helper functions for combining classes
export const combineClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getThemeClass = (category, variant = 'primary') => {
  return themeClasses[category]?.[variant] || '';
};

// Preset component classes
export const componentClasses = {
  navbar: combineClasses(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    themeClasses.bg.primary + '/95',
    themeClasses.effects.blur,
    themeClasses.border.primary,
    'border-b shadow-sm'
  ),

  postCard: combineClasses(
    themeClasses.interactive.card,
    themeClasses.effects.rounded,
    themeClasses.spacing.card
  ),

  button: {
    primary: combineClasses(
      themeClasses.interactive.buttonPrimary,
      themeClasses.interactive.button,
      themeClasses.effects.rounded,
      'px-6 py-2'
    ),
    secondary: combineClasses(
      themeClasses.interactive.buttonSecondary,
      themeClasses.interactive.button,
      themeClasses.effects.rounded,
      'px-6 py-2'
    ),
    ghost: combineClasses(
      themeClasses.interactive.buttonGhost,
      themeClasses.interactive.button,
      themeClasses.effects.rounded,
      'px-4 py-2'
    ),
  },

  input: combineClasses(
    themeClasses.interactive.input,
    themeClasses.effects.rounded,
    'px-4 py-2 w-full'
  ),

  textarea: combineClasses(
    themeClasses.interactive.input,
    themeClasses.effects.rounded,
    'px-4 py-3 w-full resize-none'
  ),

  heading: {
    h1: combineClasses(themeClasses.typography.heading, 'text-3xl md:text-4xl', themeClasses.text.primary),
    h2: combineClasses(themeClasses.typography.heading, 'text-2xl md:text-3xl', themeClasses.text.primary),
    h3: combineClasses(themeClasses.typography.heading, 'text-xl md:text-2xl', themeClasses.text.primary),
    h4: combineClasses(themeClasses.typography.heading, 'text-lg md:text-xl', themeClasses.text.primary),
  },

  page: combineClasses(
    themeClasses.layout.fullHeight,
    themeClasses.bg.primary
  ),

  pageLoading: combineClasses(
    themeClasses.layout.fullHeight,
    themeClasses.patterns.loadingState
  ),

  pageError: combineClasses(
    themeClasses.layout.fullHeight,
    themeClasses.patterns.errorState
  ),
};

export default themeClasses;
