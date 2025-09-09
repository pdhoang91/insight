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

  // Typography - Standardized Hierarchy
  typography: {
    // Font Families
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
    
    // Font Weights
    bold: 'font-bold',
    semibold: 'font-semibold',
    medium: 'font-medium',
    normal: 'font-normal',
    
    // Semantic Typography
    heading: 'font-serif font-bold',
    subheading: 'font-serif font-semibold',
    body: 'font-sans font-normal',
    caption: 'font-sans font-medium',
    label: 'font-sans font-medium',
    
    // Display Sizes (with consistent font family)
    displayLarge: 'font-serif font-bold text-display',
    displayMedium: 'font-serif font-bold text-article-title',
    
    // Heading Hierarchy
    h1: 'font-serif font-bold text-heading-1',
    h2: 'font-serif font-bold text-heading-2', 
    h3: 'font-serif font-bold text-heading-3',
    h4: 'font-serif font-semibold text-body-large',
    
    // Body Text
    bodyLarge: 'font-sans font-normal text-body-large',
    bodyMedium: 'font-sans font-normal text-body',
    bodySmall: 'font-sans font-normal text-body-small',
    
    // UI Text
    buttonText: 'font-sans font-medium text-button',
    labelText: 'font-sans font-medium text-label',
    captionText: 'font-sans font-normal text-caption',
  },

  // Layout - Mobile-first responsive
  layout: {
    // Container patterns
    container: 'max-w-container mx-auto px-lg md:px-xl lg:px-2xl',
    containerSmall: 'max-w-content mx-auto px-md md:px-lg lg:px-xl',
    containerWide: 'max-w-wide mx-auto px-lg md:px-xl lg:px-2xl',
    
    // Content patterns
    article: 'max-w-article mx-auto px-lg md:px-xl',
    reading: 'max-w-article mx-auto px-lg md:px-xl lg:px-2xl',
    
    // Layout utilities
    fullHeight: 'min-h-screen',
    sticky: 'sticky top-16 md:top-20 lg:top-24',
    stickyNav: 'sticky top-0 z-50',
    
    // Responsive grid layouts
    mainWithSidebar: 'grid grid-cols-1 lg:grid-cols-4 gap-lg lg:gap-xl items-start',
    twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-lg lg:gap-xl',
    threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg lg:gap-xl',
    
    // Flex layouts
    flexColumn: 'flex flex-col gap-lg lg:gap-xl',
    flexRow: 'flex flex-col lg:flex-row gap-lg lg:gap-xl',
  },

  // Interactive states with touch targets
  interactive: {
    button: 'min-h-[44px] min-w-[44px] touch-manipulation transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-medium-accent-green/50',
    buttonPrimary: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 min-h-[44px] touch-manipulation',
    buttonSecondary: 'bg-medium-bg-secondary text-medium-text-primary hover:bg-medium-bg-primary min-h-[44px] touch-manipulation',
    buttonGhost: 'text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-bg-secondary min-h-[44px] touch-manipulation',
    input: 'bg-medium-bg-secondary border-medium-border text-medium-text-primary placeholder-medium-text-muted focus:border-medium-accent-green focus:ring-2 focus:ring-medium-accent-green/50 min-h-[44px]',
    card: 'bg-medium-bg-card border-medium-border hover:border-medium-accent-green/40 transition-colors duration-300',
    touchTarget: 'min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center',
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
  
  // Standardized Icons - Updated for consistency
  icons: {
    // Icon Sizes (Standardized)
    xs: 'w-3 h-3',      // 12px - Very small UI elements, badges
    sm: 'w-4 h-4',      // 16px - Default size for most UI icons (buttons, nav, etc.)
    md: 'w-5 h-5',      // 20px - Medium emphasis icons (section headers, important actions)
    lg: 'w-6 h-6',      // 24px - Large interactive elements, primary actions
    xl: 'w-8 h-8',      // 32px - Avatar/profile icons, hero elements
    
    // Icon Colors & States
    primary: 'text-medium-text-primary',
    secondary: 'text-medium-text-secondary',
    muted: 'text-medium-text-muted',
    accent: 'text-medium-accent-green',
    interactive: 'text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',
    
    // Interactive States
    button: 'transition-all duration-200 group-hover:scale-110',
    clickable: 'cursor-pointer hover:text-medium-accent-green transition-colors duration-200',
    
    // Combined Size + Color Utilities
    buttonSm: 'w-4 h-4 text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',
    buttonMd: 'w-5 h-5 text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',
    accentSm: 'w-4 h-4 text-medium-accent-green',
    accentMd: 'w-5 h-5 text-medium-accent-green',
  },

  // Spacing - Mobile-first approach
  spacing: {
    // Section spacing
    section: 'py-xl md:py-2xl lg:py-3xl',
    sectionSmall: 'py-lg md:py-xl lg:py-2xl',
    
    // Card spacing
    card: 'p-lg md:p-xl lg:p-2xl',
    cardSmall: 'p-md md:p-lg',
    cardLarge: 'p-xl md:p-2xl lg:p-3xl',
    
    // Gap spacing
    gap: 'gap-lg md:gap-xl lg:gap-2xl',
    gapSmall: 'gap-md md:gap-lg',
    gapLarge: 'gap-xl md:gap-2xl lg:gap-3xl',
    
    // Container spacing
    container: 'px-lg md:px-xl lg:px-2xl',
    containerSmall: 'px-md md:px-lg',
    containerLarge: 'px-xl md:px-2xl lg:px-3xl',
  },
  
  // Responsive Layout Patterns
  responsive: {
    // Mobile-first grid patterns
    gridMobileSingle: 'grid grid-cols-1',
    gridTabletDouble: 'grid grid-cols-1 md:grid-cols-2',
    gridDesktopTriple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    gridDesktopQuad: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    
    // Flex patterns
    flexMobileColumn: 'flex flex-col',
    flexTabletRow: 'flex flex-col md:flex-row',
    flexDesktopRow: 'flex flex-col lg:flex-row',
    
    // Sidebar patterns
    sidebarMobileHidden: 'hidden lg:block',
    sidebarMobileCollapsed: 'lg:hidden',
    sidebarDesktopSticky: 'lg:sticky lg:top-24',
    
    // Text alignment
    textMobileCenter: 'text-center lg:text-left',
    textMobileLeft: 'text-left',
    
    // Visibility
    mobileOnly: 'block md:hidden',
    tabletOnly: 'hidden md:block lg:hidden', 
    desktopOnly: 'hidden lg:block',
    touchOnly: 'block lg:hidden',
    
    // Sizing
    fullMobile: 'w-full',
    autoDesktop: 'w-full lg:w-auto',
    sidebarWidth: 'w-full lg:w-sidebar lg:flex-shrink-0',
  },

  // Shadows and effects
  effects: {
    shadow: 'shadow-sm',
    shadowLarge: 'shadow-lg',
    rounded: 'rounded-lg',
    roundedFull: 'rounded-full',
    blur: 'backdrop-blur-md',
  },

  // Advanced animations and micro-interactions
  animations: {
    // Entry animations
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    slideLeft: 'animate-slide-left',
    slideRight: 'animate-slide-right',
    scaleIn: 'animate-scale-in',
    
    // Interactive animations
    hoverLift: 'hover:animate-hover-lift',
    tapScale: 'active:animate-tap-scale',
    focusRing: 'focus:animate-focus-ring',
    
    // Feedback animations
    bounceSubtle: 'animate-bounce-subtle',
    shake: 'animate-shake',
    pulseGentle: 'animate-pulse-gentle',
    glow: 'animate-glow',
    
    // Loading animations
    skeleton: 'animate-skeleton bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary bg-[length:200%_100%]',
    spinSlow: 'animate-spin-slow',
    pingSlow: 'animate-ping-slow',
    
    // Smooth transitions
    smooth: 'transition-all duration-200 ease-out',
    smoothSlow: 'transition-all duration-300 ease-out',
    smoothFast: 'transition-all duration-150 ease-out',
  },

  // Interaction states with animations
  interactions: {
    // Card interactions
    cardHover: 'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200',
    cardPress: 'active:scale-[0.98] transition-transform duration-100',
    
    // Button interactions
    buttonHover: 'hover:shadow-button-hover hover:-translate-y-0.5 transition-all duration-200',
    buttonPress: 'active:scale-95 transition-transform duration-100',
    buttonFocus: 'focus:ring-2 focus:ring-medium-accent-green focus:ring-opacity-50 focus:outline-none',
    
    // Link interactions
    linkHover: 'hover:text-medium-accent-green transition-colors duration-200',
    linkUnderline: 'hover:underline decoration-2 underline-offset-2 transition-all duration-200',
    
    // Icon interactions
    iconHover: 'hover:scale-110 hover:text-medium-accent-green transition-all duration-200',
    iconPress: 'active:scale-95 transition-transform duration-100',
    
    // Input interactions
    inputFocus: 'focus:ring-2 focus:ring-medium-accent-green focus:border-medium-accent-green transition-all duration-200',
    inputHover: 'hover:border-medium-text-secondary transition-colors duration-200',
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
    h1: combineClasses(themeClasses.typography.h1, themeClasses.text.primary),
    h2: combineClasses(themeClasses.typography.h2, themeClasses.text.primary),
    h3: combineClasses(themeClasses.typography.h3, themeClasses.text.primary),
    h4: combineClasses(themeClasses.typography.h4, themeClasses.text.primary),
    display: combineClasses(themeClasses.typography.displayLarge, themeClasses.text.primary),
    article: combineClasses(themeClasses.typography.displayMedium, themeClasses.text.primary),
  },
  
  text: {
    body: combineClasses(themeClasses.typography.bodyMedium, themeClasses.text.primary),
    bodyLarge: combineClasses(themeClasses.typography.bodyLarge, themeClasses.text.primary),
    bodySmall: combineClasses(themeClasses.typography.bodySmall, themeClasses.text.secondary),
    caption: combineClasses(themeClasses.typography.captionText, themeClasses.text.muted),
    label: combineClasses(themeClasses.typography.labelText, themeClasses.text.secondary),
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
