// utils/themeClasses.js
// Centralized theme class utilities to avoid hardcoding

export const themeClasses = {
  // Background colors
  bg: {
    primary: 'bg-medium-bg-primary',
    secondary: 'bg-medium-bg-secondary', 
    card: 'bg-medium-bg-card',
    elevated: 'bg-medium-bg-elevated',
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

  // Typography - Enhanced Standardized Hierarchy
  typography: {
    // Font Families - Consistent usage
    serif: 'font-serif',
    sans: 'font-sans', 
    mono: 'font-mono',
    
    // Font Weights - Semantic naming
    weightLight: 'font-light',     // 300
    weightNormal: 'font-normal',   // 400
    weightMedium: 'font-medium',   // 500
    weightSemibold: 'font-semibold', // 600
    weightBold: 'font-bold',       // 700
    weightBlack: 'font-black',     // 900
    
    // Display Typography - Hero sections
    displayHero: 'font-serif font-black text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight',
    displayLarge: 'font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight',
    displayMedium: 'font-serif font-bold text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight',
    
    // Heading Hierarchy - Consistent scale
    h1: 'font-serif font-bold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight',
    h2: 'font-serif font-bold text-xl md:text-2xl lg:text-3xl leading-tight tracking-tight',
    h3: 'font-serif font-bold text-lg md:text-xl lg:text-2xl leading-snug tracking-tight',
    h4: 'font-serif font-semibold text-base md:text-lg lg:text-xl leading-snug',
    h5: 'font-serif font-semibold text-sm md:text-base lg:text-lg leading-snug',
    h6: 'font-serif font-semibold text-xs md:text-sm lg:text-base leading-snug',
    
    // Body Text - Reading optimized
    bodyHero: 'font-serif font-normal text-xl md:text-2xl lg:text-3xl leading-relaxed',
    bodyLarge: 'font-serif font-normal text-lg md:text-xl lg:text-2xl leading-relaxed',
    bodyMedium: 'font-sans font-normal text-base md:text-lg leading-relaxed',
    bodySmall: 'font-sans font-normal text-sm md:text-base leading-relaxed',
    bodyTiny: 'font-sans font-normal text-xs md:text-sm leading-normal',
    
    // UI Text - Interface elements
    buttonLarge: 'font-sans font-semibold text-base md:text-lg leading-none',
    buttonMedium: 'font-sans font-medium text-sm md:text-base leading-none',
    buttonSmall: 'font-sans font-medium text-xs md:text-sm leading-none',
    labelLarge: 'font-sans font-medium text-sm md:text-base leading-tight',
    labelMedium: 'font-sans font-medium text-xs md:text-sm leading-tight',
    labelSmall: 'font-sans font-medium text-xs leading-tight',
    captionText: 'font-sans font-normal text-xs md:text-sm leading-tight text-medium-text-muted',
    
    // Specialized Typography
    code: 'font-mono font-normal text-sm leading-relaxed',
    quote: 'font-serif font-normal text-lg md:text-xl leading-relaxed italic',
    subtitle: 'font-sans font-normal text-lg md:text-xl leading-relaxed text-medium-text-secondary',
  },

  // Layout - Mobile-first with minimal padding on small screens, heavy padding on large screens
  layout: {
    // Container patterns - Minimal padding on mobile, increasing dramatically on large screens
    container: 'max-w-container mx-auto px-3 md:px-4 lg:px-8 xl:px-20 2xl:px-32',        // Minimal mobile, heavy desktop
    containerSmall: 'max-w-compact mx-auto px-2 md:px-3 lg:px-6 xl:px-16',              // Very minimal mobile
    containerWide: 'max-w-wide mx-auto px-3 md:px-4 lg:px-8 xl:px-20 2xl:px-32',         // Same strategy as container
    
    // Content patterns - Prioritize width on mobile, constrain on desktop
    article: 'max-w-reading mx-auto px-3 md:px-4 lg:px-8 xl:px-20',                     // Minimal mobile padding
    reading: 'max-w-reading mx-auto px-3 md:px-4 lg:px-8 xl:px-20',                     // Same as article
    
    // Layout utilities
    fullHeight: 'min-h-screen',
    sticky: 'sticky top-16 md:top-20 lg:top-24',
    stickyNav: 'sticky top-0 z-50',
    
    // Responsive grid layouts - Better scaling
    mainWithSidebar: 'grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 items-start',
    twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 xl:gap-8',
    threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8',
    fourColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 xl:gap-8',
    
    // Flex layouts - Enhanced responsive behavior
    flexColumn: 'flex flex-col gap-4 lg:gap-6 xl:gap-8',
    flexRow: 'flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8',
  },

  // Interactive states with enhanced touch targets and accessibility
  interactive: {
    // Base interactive styles
    base: 'touch-manipulation transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-medium-accent-green focus-visible:ring-offset-2',
    touchTarget: 'min-h-[44px] min-w-[44px] flex items-center justify-center',
    
    // Button variants with consistent sizing and states
    buttonBase: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonLarge: 'px-6 py-3 min-h-[48px] text-base',
    buttonMedium: 'px-4 py-2 min-h-[44px] text-sm',
    buttonSmall: 'px-3 py-1.5 min-h-[36px] text-xs',
    
    // Button color variants
    buttonPrimary: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 focus-visible:ring-medium-accent-green shadow-sm hover:shadow-md',
    buttonSecondary: ' text-medium-text-primary hover:bg-medium-hover border border-medium-border focus-visible:ring-medium-accent-green',
    buttonGhost: 'text-medium-text-secondary hover:text-medium-accent-green hover: focus-visible:ring-medium-accent-green',
    buttonDanger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm hover:shadow-md',
    
    // Input styles with consistent sizing
    inputBase: 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medium-accent-green/50 focus:border-medium-accent-green disabled:opacity-50 disabled:cursor-not-allowed',
    inputLarge: 'px-4 py-3 min-h-[48px] text-base',
    inputMedium: 'px-3 py-2 min-h-[44px] text-sm',
    inputSmall: 'px-2 py-1.5 min-h-[36px] text-xs',
    input: 'border-medium-border text-medium-text-primary placeholder-medium-text-muted',
    
    // Card interactions with hover states
    cardBase: 'rounded-lg shadow-sm transition-all duration-200',
    cardHover: 'hover:shadow-md hover:-translate-y-0.5',
    cardClickable: 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]',
    
    // Link styles
    link: 'text-medium-accent-green hover:text-medium-accent-green/80 transition-colors duration-200',
    linkUnderline: 'underline decoration-2 underline-offset-2 hover:decoration-medium-accent-green/60',
  },

  // Common patterns
  patterns: {
    loadingState: 'bg-medium-bg-primary flex items-center justify-center',
    errorState: 'bg-medium-bg-primary text-center',
    emptyState: 'bg-medium-bg-primary text-center py-12',
    skeleton: ' animate-pulse',
    avatar: ' border-medium-border rounded-full flex items-center justify-center',
    tag: ' text-medium-text-secondary px-3 py-1 rounded-full text-sm',
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
    
    // Enhanced Interactive States
    button: 'transition-all duration-200 group-hover:scale-110',
    clickable: 'cursor-pointer hover:text-medium-accent-green transition-colors duration-200',
    float: 'cursor-pointer transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
    pulse: 'cursor-pointer transition-all duration-200',
    magnetic: 'cursor-pointer transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Combined Size + Color Utilities
    buttonSm: 'w-4 h-4 text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',
    buttonMd: 'w-5 h-5 text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',
    accentSm: 'w-4 h-4 text-medium-accent-green',
    accentMd: 'w-5 h-5 text-medium-accent-green',
  },

  // Spacing - Mobile-first approach with enhanced consistency
  spacing: {
    // Section spacing - Consistent vertical rhythm with large screen optimization
    section: 'py-6 md:py-8 lg:py-12 xl:py-10 2xl:py-8',          // Reduced on very large screens
    sectionLarge: 'py-8 md:py-12 lg:py-16 xl:py-14 2xl:py-12',   // Controlled growth
    sectionSmall: 'py-4 md:py-6 lg:py-8 xl:py-6',                // Compact spacing
    
    // Card spacing - Consistent internal padding
    card: 'py-4 md:py-6 lg:py-8 xl:py-6 2xl:py-5',                   // Optimized for readability
    cardSmall: 'py-3 md:py-4 lg:py-5 xl:py-4',                      // Compact cards
    cardLarge: 'py-6 md:py-8 lg:py-10 xl:py-8 2xl:py-6',             // Large but controlled
    
    // Gap spacing - For flex/grid layouts with better scaling
    gap: 'gap-4 md:gap-6 lg:gap-8 xl:gap-6 2xl:gap-5',          // Controlled spacing
    gapSmall: 'gap-2 md:gap-3 lg:gap-4 xl:gap-3',               // Tight layouts
    gapLarge: 'gap-6 md:gap-8 lg:gap-12 xl:gap-10 2xl:gap-8',   // Spacious but not excessive
    
    // Stack spacing - For vertical layouts
    stack: 'space-y-4 md:space-y-6 lg:space-y-8',
    stackSmall: 'space-y-2 md:space-y-3 lg:space-y-4',
    stackLarge: 'space-y-6 md:space-y-8 lg:space-y-12',
    
    // Container spacing - Minimal mobile padding, heavy desktop padding
    container: 'px-3 md:px-4 lg:px-8 xl:px-20 2xl:px-32',         // Minimal mobile, heavy desktop
    containerSmall: 'px-2 md:px-3 lg:px-6 xl:px-16',             // Very minimal mobile
    containerLarge: 'px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-40',  // Progressive increase to desktop
    
    // Margin utilities
    marginTop: 'mt-4 md:mt-6 lg:mt-8',
    marginBottom: 'mb-4 md:mb-6 lg:mb-8',
    marginVertical: 'my-4 md:my-6 lg:my-8',
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
    
    // Sizing - Enhanced sidebar width
    fullMobile: 'w-full',
    autoDesktop: 'w-full lg:w-auto',
    sidebarWidth: 'w-full lg:w-96 xl:w-80 2xl:w-72 lg:flex-shrink-0',
    sidebarWidthLarge: 'w-full lg:w-80 xl:w-72 2xl:w-64 lg:flex-shrink-0',
  },

  // Enhanced shadows and effects with layered system
  effects: {
    // Basic shadows
    shadow: 'shadow-sm',
    shadowLarge: 'shadow-lg',
    
    // Layered shadow system
    shadowLayered: 'shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]',
    shadowLayeredMd: 'shadow-[0_3px_6px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.12)]',
    shadowLayeredLg: 'shadow-[0_10px_20px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.10)]',
    shadowLayeredXl: 'shadow-[0_15px_35px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.07)]',
    
    // Hover shadow progressions
    shadowHoverSoft: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.12)]',
    shadowHoverMedium: 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.10)]',
    shadowHoverStrong: 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),0_5px_10px_rgba(0,0,0,0.10)]',
    
    // Colored shadows for accent elements
    shadowAccent: 'shadow-[0_4px_14px_0_rgba(26,137,23,0.15)]',
    shadowAccentHover: 'hover:shadow-[0_8px_25px_0_rgba(26,137,23,0.25)]',
    
    // Border radius
    rounded: 'rounded-lg',
    roundedFull: 'rounded-full',
    roundedDynamic: 'rounded-lg hover:rounded-xl transition-all duration-300',
    
    // Effects
    blur: 'backdrop-blur-md',
    glow: 'shadow-[0_0_20px_rgba(26,137,23,0.3)]',
    glowSubtle: 'shadow-[0_0_10px_rgba(26,137,23,0.15)]',
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
    
    // Enhanced Micro-interactions
    microBounce: 'hover:animate-micro-bounce',
    gentleFloat: 'hover:animate-gentle-float',
    subtlePulse: 'hover:animate-subtle-pulse',
    magneticPull: 'hover:animate-magnetic-pull',
    springScale: 'hover:animate-spring-scale',
    
    // Feedback animations
    bounceSubtle: 'animate-bounce-subtle',
    shake: 'animate-shake',
    pulseGentle: 'animate-pulse-gentle',
    glow: 'animate-glow',
    
    // Loading animations
    skeleton: 'animate-skeleton bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary bg-[length:200%_100%]',
    spinSlow: 'animate-spin-slow',
    pingSlow: 'animate-ping-slow',
    
    // Smooth transitions with spring physics
    smooth: 'transition-all duration-200 ease-out',
    smoothSlow: 'transition-all duration-300 ease-out',
    smoothFast: 'transition-all duration-150 ease-out',
    spring: 'transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
    springFast: 'transition-all duration-200 cubic-bezier(0.34, 1.56, 0.64, 1)',
    elastic: 'transition-all duration-400 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Enhanced interaction states with micro-animations
  interactions: {
    // Card interactions with layered effects
    cardHover: 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
    cardHoverSubtle: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 ease-out',
    cardPress: 'active:scale-[0.98] active:shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition-all duration-100',
    cardFloat: 'hover:shadow-[0_15px_35px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.07)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    // Button interactions with spring physics
    buttonHover: 'hover:shadow-[0_8px_25px_rgba(26,137,23,0.25)] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
    buttonHoverSubtle: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out',
    buttonPress: 'active:scale-95 active:shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition-all duration-100',
    buttonFocus: 'focus:ring-2 focus:ring-medium-accent-green focus:ring-opacity-50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,137,23,0.1)]',
    buttonMagnetic: 'hover:shadow-[0_10px_30px_rgba(26,137,23,0.3)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Link interactions with micro-feedback
    linkHover: 'hover:text-medium-accent-green hover:scale-[1.02] transition-all duration-200 cubic-bezier(0.34, 1.56, 0.64, 1)',
    linkUnderline: 'hover:underline decoration-2 underline-offset-2 hover:decoration-medium-accent-green/80 transition-all duration-200',
    linkFloat: 'hover:text-medium-accent-green hover:-translate-y-0.5 hover:drop-shadow-sm transition-all duration-200 ease-out',
    
    // Icon interactions with spring animations
    iconHover: 'hover:scale-110 hover:text-medium-accent-green hover:drop-shadow-sm transition-all duration-200 cubic-bezier(0.34, 1.56, 0.64, 1)',
    iconPress: 'active:scale-95 transition-transform duration-100',
    iconFloat: 'hover:scale-110 hover:text-medium-accent-green hover:-translate-y-0.5 hover:drop-shadow-md transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
    iconPulse: 'hover:scale-110 hover:text-medium-accent-green hover:shadow-[0_0_10px_rgba(26,137,23,0.3)] transition-all duration-200',
    
    // Input interactions with enhanced feedback
    inputFocus: 'focus:ring-2 focus:ring-medium-accent-green focus:border-medium-accent-green focus:shadow-[0_0_0_3px_rgba(26,137,23,0.1)] transition-all duration-200',
    inputHover: 'hover:border-medium-text-secondary hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-200',
    inputFloating: 'focus:shadow-[0_8px_25px_rgba(26,137,23,0.15)] focus:-translate-y-0.5 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
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
    // Large buttons - Primary actions
    primaryLarge: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonLarge,
      themeClasses.interactive.buttonPrimary
    ),
    secondaryLarge: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonLarge,
      themeClasses.interactive.buttonSecondary
    ),
    ghostLarge: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonLarge,
      themeClasses.interactive.buttonGhost
    ),
    
    // Medium buttons - Default size with enhanced hover
    primary: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonPrimary,
      themeClasses.interactions.buttonHover
    ),
    primaryMagnetic: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonPrimary,
      themeClasses.interactions.buttonMagnetic
    ),
    secondary: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonSecondary,
      themeClasses.interactions.buttonHoverSubtle
    ),
    ghost: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonGhost,
      themeClasses.interactions.buttonHoverSubtle
    ),
    danger: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonDanger,
      themeClasses.interactions.buttonHover
    ),
    
    // Small buttons - Compact areas
    primarySmall: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonSmall,
      themeClasses.interactive.buttonPrimary
    ),
    secondarySmall: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonSmall,
      themeClasses.interactive.buttonSecondary
    ),
    ghostSmall: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonSmall,
      themeClasses.interactive.buttonGhost
    ),
  },

  input: {
    large: combineClasses(
      themeClasses.interactive.inputBase,
      themeClasses.interactive.inputLarge,
      themeClasses.interactive.input
    ),
    medium: combineClasses(
      themeClasses.interactive.inputBase,
      themeClasses.interactive.inputMedium,
      themeClasses.interactive.input
    ),
    small: combineClasses(
      themeClasses.interactive.inputBase,
      themeClasses.interactive.inputSmall,
      themeClasses.interactive.input
    ),
  },

  textarea: {
    large: combineClasses(
      themeClasses.interactive.inputBase,
      themeClasses.interactive.inputLarge,
      themeClasses.interactive.input,
      'resize-none min-h-[120px]'
    ),
    medium: combineClasses(
      themeClasses.interactive.inputBase,
      themeClasses.interactive.inputMedium,
      themeClasses.interactive.input,
      'resize-none min-h-[100px]'
    ),
    small: combineClasses(
      themeClasses.interactive.inputBase,
      themeClasses.interactive.inputSmall,
      themeClasses.interactive.input,
      'resize-none min-h-[80px]'
    ),
  },

  card: {
    base: combineClasses(
      themeClasses.interactive.cardBase,
      themeClasses.spacing.card
    ),
    hover: combineClasses(
      themeClasses.interactive.cardBase,
      themeClasses.interactive.cardHover,
      themeClasses.spacing.card
    ),
    hoverSubtle: combineClasses(
      themeClasses.interactive.cardBase,
      themeClasses.interactive.cardHoverSubtle,
      themeClasses.spacing.card
    ),
    float: combineClasses(
      themeClasses.interactive.cardBase,
      themeClasses.interactive.cardFloat,
      themeClasses.spacing.card
    ),
    clickable: combineClasses(
      themeClasses.interactive.cardBase,
      themeClasses.interactive.cardClickable,
      themeClasses.spacing.card
    ),
  },

  heading: {
    h1: combineClasses(themeClasses.typography.h1, themeClasses.text.primary),
    h2: combineClasses(themeClasses.typography.h2, themeClasses.text.primary),
    h3: combineClasses(themeClasses.typography.h3, themeClasses.text.primary),
    h4: combineClasses(themeClasses.typography.h4, themeClasses.text.primary),
    h5: combineClasses(themeClasses.typography.h5, themeClasses.text.primary),
    h6: combineClasses(themeClasses.typography.h6, themeClasses.text.primary),
    display: combineClasses(themeClasses.typography.displayLarge, themeClasses.text.primary),
    article: combineClasses(themeClasses.typography.displayMedium, themeClasses.text.primary),
  },
  
  text: {
    // Display text
    displayHero: combineClasses(themeClasses.typography.displayHero, themeClasses.text.primary),
    displayLarge: combineClasses(themeClasses.typography.displayLarge, themeClasses.text.primary),
    displayMedium: combineClasses(themeClasses.typography.displayMedium, themeClasses.text.primary),
    
    // Body text with semantic colors
    bodyHero: combineClasses(themeClasses.typography.bodyHero, themeClasses.text.primary),
    bodyLarge: combineClasses(themeClasses.typography.bodyLarge, themeClasses.text.primary),
    body: combineClasses(themeClasses.typography.bodyMedium, themeClasses.text.primary),
    bodySmall: combineClasses(themeClasses.typography.bodySmall, themeClasses.text.secondary),
    bodyTiny: combineClasses(themeClasses.typography.bodyTiny, themeClasses.text.muted),
    
    // UI text
    buttonLarge: combineClasses(themeClasses.typography.buttonLarge),
    buttonMedium: combineClasses(themeClasses.typography.buttonMedium),
    buttonSmall: combineClasses(themeClasses.typography.buttonSmall),
    labelLarge: combineClasses(themeClasses.typography.labelLarge, themeClasses.text.secondary),
    labelMedium: combineClasses(themeClasses.typography.labelMedium, themeClasses.text.secondary),
    labelSmall: combineClasses(themeClasses.typography.labelSmall, themeClasses.text.muted),
    caption: combineClasses(themeClasses.typography.captionText),
    
    // Specialized text
    code: combineClasses(themeClasses.typography.code, themeClasses.text.primary),
    quote: combineClasses(themeClasses.typography.quote, themeClasses.text.secondary),
    subtitle: combineClasses(themeClasses.typography.subtitle),
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

// Enhanced theme classes for comprehensive CSS management
export const enhancedThemeClasses = {
  // Error states for forms and validation
  error: {
    text: 'text-red-500',
    textLight: 'text-red-400',
    border: 'border-red-500',
    borderLight: 'border-red-300',
    bg: 'bg-red-50',
    bgDark: 'bg-red-100',
    ring: 'ring-red-500',
    ringLight: 'ring-red-300',
    focus: 'focus:border-red-500 focus:ring-red-500',
  },

  // Success states
  success: {
    text: 'text-green-500',
    textLight: 'text-green-400', 
    border: 'border-green-500',
    borderLight: 'border-green-300',
    bg: 'bg-green-50',
    bgDark: 'bg-green-100',
    ring: 'ring-green-500',
    ringLight: 'ring-green-300',
  },

  // Warning states
  warning: {
    text: 'text-yellow-500',
    textLight: 'text-yellow-400',
    border: 'border-yellow-500', 
    borderLight: 'border-yellow-300',
    bg: 'bg-yellow-50',
    bgDark: 'bg-yellow-100',
    ring: 'ring-yellow-500',
    ringLight: 'ring-yellow-300',
  },

  // Form-specific classes
  form: {
    label: combineClasses('block mb-2', themeClasses.typography.labelMedium, themeClasses.text.primary),
    labelRequired: combineClasses('block mb-2', themeClasses.typography.labelMedium, themeClasses.text.primary, 'after:content-["*"] after:ml-0.5 after:text-red-500'),
    helperText: combineClasses('mt-2', themeClasses.typography.bodyTiny, themeClasses.text.muted),
    errorText: combineClasses('mt-2', themeClasses.typography.bodyTiny, 'text-red-500'),
    successText: combineClasses('mt-2', themeClasses.typography.bodyTiny, 'text-green-500'),
    fieldset: combineClasses('space-y-4'),
    fieldsetLarge: combineClasses('space-y-6'),
    group: combineClasses('space-y-2'),
    groupInline: combineClasses('flex items-center space-x-3'),
  },

  // Content/Prose styling for articles
  prose: {
    small: 'prose prose-sm max-w-none prose-slate dark:prose-invert',
    base: 'prose prose-base max-w-none prose-slate dark:prose-invert',
    large: 'prose prose-lg max-w-none prose-slate dark:prose-invert',
    xl: 'prose prose-xl max-w-none prose-slate dark:prose-invert',
    // Custom prose variants
    compact: 'prose prose-sm max-w-none prose-slate dark:prose-invert prose-p:my-2 prose-headings:my-3',
    relaxed: 'prose prose-base max-w-none prose-slate dark:prose-invert prose-p:my-4 prose-headings:my-6',
  },

  // Utility classes for common patterns
  utils: {
    // Dividers
    divider: combineClasses('border-t', themeClasses.border.primary, 'my-4'),
    dividerVertical: combineClasses('border-l', themeClasses.border.primary, 'mx-4'),
    dividerDashed: combineClasses('border-t border-dashed', themeClasses.border.primary, 'my-4'),
    
    // Common spacing patterns
    section: 'mb-6 sm:mb-8',
    sectionLarge: 'mb-8 sm:mb-12 lg:mb-16',
    sectionSmall: 'mb-4 sm:mb-6',
    
    // Display utilities with theme awareness
    hidden: 'hidden',
    block: 'block',
    flex: 'flex',
    grid: 'grid',
    inlineBlock: 'inline-block',
    inlineFlex: 'inline-flex',
    
    // Position utilities
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
    
    // Overflow utilities
    overflowHidden: 'overflow-hidden',
    overflowAuto: 'overflow-auto',
    overflowScroll: 'overflow-scroll',
    
    // Truncate text
    truncate: 'truncate',
    textEllipsis: 'text-ellipsis overflow-hidden',
    
    // Screen reader only
    srOnly: 'sr-only',
    notSrOnly: 'not-sr-only',
    
    // Full width/height
    full: 'w-full h-full',
    fullWidth: 'w-full',
    fullHeight: 'h-full',
    fullScreen: 'w-screen h-screen',
  },

  // Modal and overlay patterns
  modal: {
    overlay: combineClasses(
      'fixed inset-0 z-50 flex items-center justify-center',
      themeClasses.bg.primary + '/80',
      themeClasses.effects.blur
    ),
    content: combineClasses(
      'relative w-full max-w-md mx-4 p-6',
      themeClasses.bg.elevated,
      themeClasses.effects.rounded,
      themeClasses.effects.shadowLayeredLg,
      themeClasses.border.primary,
      'border'
    ),
    contentLarge: combineClasses(
      'relative w-full max-w-2xl mx-4 p-8',
      themeClasses.bg.elevated,
      themeClasses.effects.rounded,
      themeClasses.effects.shadowLayeredLg,
      themeClasses.border.primary,
      'border'
    ),
    header: combineClasses('pb-4 border-b', themeClasses.border.primary),
    footer: combineClasses('pt-4 border-t', themeClasses.border.primary, 'flex justify-end space-x-3'),
    closeButton: combineClasses(
      'absolute top-4 right-4 p-1 rounded-full',
      themeClasses.text.muted,
      'hover:text-medium-text-primary hover:bg-medium-hover',
      themeClasses.animations.smooth
    ),
  },

  // Tag and badge patterns
  tag: {
    base: combineClasses(
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
      themeClasses.animations.smooth
    ),
    primary: combineClasses(
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
      themeClasses.bg.accent,
      themeClasses.text.white,
      'hover:bg-medium-accent-green/90'
    ),
    secondary: combineClasses(
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
      themeClasses.bg.secondary,
      themeClasses.text.secondary,
      'hover:bg-medium-hover'
    ),
    outline: combineClasses(
      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
      themeClasses.border.primary,
      themeClasses.text.secondary,
      'hover:bg-medium-hover'
    ),
  },

  // List patterns
  list: {
    base: 'space-y-2',
    compact: 'space-y-1',
    relaxed: 'space-y-4',
    horizontal: 'flex flex-wrap gap-2',
    horizontalSpaced: 'flex flex-wrap gap-4',
    grid: 'grid grid-cols-1 gap-4',
    gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  },

  // Avatar patterns
  avatar: {
    xs: 'w-6 h-6 rounded-full',
    sm: 'w-8 h-8 rounded-full',
    md: 'w-10 h-10 rounded-full',
    lg: 'w-12 h-12 rounded-full',
    xl: 'w-16 h-16 rounded-full',
    '2xl': 'w-20 h-20 rounded-full',
    square: 'rounded-lg',
    squareSmall: 'w-8 h-8 rounded-md',
    squareLarge: 'w-16 h-16 rounded-lg',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-medium-accent-green',
    pulse: combineClasses('animate-pulse', themeClasses.bg.secondary),
    skeleton: combineClasses(
      'animate-pulse rounded',
      'bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary',
      'bg-[length:200%_100%]'
    ),
    skeletonText: combineClasses(
      'animate-pulse rounded h-4',
      'bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary',
      'bg-[length:200%_100%]'
    ),
    skeletonAvatar: combineClasses(
      'animate-pulse rounded-full',
      'bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary',
      'bg-[length:200%_100%]'
    ),
  },

  // Focus and accessibility
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-medium-accent-green focus:ring-offset-2',
    ringInset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-medium-accent-green',
    visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medium-accent-green focus-visible:ring-offset-2',
  },

  // Status indicators
  status: {
    online: combineClasses('bg-green-500', 'w-2 h-2 rounded-full'),
    offline: combineClasses('bg-gray-400', 'w-2 h-2 rounded-full'),
    pending: combineClasses('bg-yellow-500', 'w-2 h-2 rounded-full'),
    error: combineClasses('bg-red-500', 'w-2 h-2 rounded-full'),
    success: combineClasses('bg-green-500', 'w-2 h-2 rounded-full'),
  },

  // Badge components
  badge: {
    primary: combineClasses(
      themeClasses.bg.accent,
      themeClasses.text.white,
      'px-2 py-1 rounded-full text-xs font-medium',
      themeClasses.animations.smooth
    ),
    secondary: combineClasses(
      themeClasses.bg.secondary,
      themeClasses.text.secondary,
      'px-2 py-1 rounded-full text-xs font-medium',
      themeClasses.animations.smooth
    ),
    outline: combineClasses(
      'border',
      themeClasses.border.primary,
      themeClasses.text.secondary,
      'px-2 py-1 rounded-full text-xs font-medium bg-transparent',
      themeClasses.animations.smooth
    ),
    count: combineClasses(
      'bg-red-500 text-white',
      'px-1.5 py-0.5 rounded-full text-xs font-medium',
      'min-w-[1.25rem] h-5 flex items-center justify-center',
      themeClasses.animations.smooth
    ),
    notification: combineClasses(
      themeClasses.bg.accent,
      themeClasses.text.white,
      'w-2 h-2 rounded-full absolute -top-1 -right-1',
      'animate-pulse'
    ),
  },

  // Menu and dropdown components
  menu: {
    container: combineClasses(
      themeClasses.bg.elevated,
      themeClasses.border.primary,
      themeClasses.effects.shadowLayeredMd,
      'border rounded-lg py-2 min-w-[12rem]',
      themeClasses.animations.smooth
    ),
    item: combineClasses(
      'px-4 py-2 text-sm cursor-pointer flex items-center gap-3',
      themeClasses.text.primary,
      'hover:bg-medium-hover',
      themeClasses.animations.smooth
    ),
    itemDanger: combineClasses(
      'px-4 py-2 text-sm cursor-pointer flex items-center gap-3',
      'text-red-600 hover:bg-red-50 hover:text-red-700',
      themeClasses.animations.smooth
    ),
    divider: combineClasses(
      'my-2 border-t',
      themeClasses.border.primary
    ),
  },

  // Search and input enhancements
  search: {
    container: combineClasses(
      'relative flex items-center',
      themeClasses.animations.smooth
    ),
    input: combineClasses(
      themeClasses.interactive.inputBase,
      themeClasses.interactive.inputMedium,
      themeClasses.interactive.input,
      'pl-10 pr-4'
    ),
    icon: combineClasses(
      'absolute left-3 top-1/2 transform -translate-y-1/2',
      themeClasses.icons.sm,
      themeClasses.text.muted
    ),
    results: combineClasses(
      'absolute top-full left-0 right-0 z-50 mt-2',
      themeClasses.bg.elevated,
      themeClasses.border.primary,
      themeClasses.effects.shadowLayeredMd,
      'border rounded-lg max-h-96 overflow-y-auto'
    ),
  },
};

// Merge enhanced classes with existing theme classes
Object.keys(enhancedThemeClasses).forEach(key => {
  if (themeClasses[key]) {
    themeClasses[key] = { ...themeClasses[key], ...enhancedThemeClasses[key] };
  } else {
    themeClasses[key] = enhancedThemeClasses[key];
  }
});

export default themeClasses;
