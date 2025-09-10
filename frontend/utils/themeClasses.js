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
    buttonSecondary: 'bg-medium-bg-secondary text-medium-text-primary hover:bg-medium-hover border border-medium-border focus-visible:ring-medium-accent-green',
    buttonGhost: 'text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-bg-secondary focus-visible:ring-medium-accent-green',
    buttonDanger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm hover:shadow-md',
    
    // Input styles with consistent sizing
    inputBase: 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medium-accent-green/50 focus:border-medium-accent-green disabled:opacity-50 disabled:cursor-not-allowed',
    inputLarge: 'px-4 py-3 min-h-[48px] text-base',
    inputMedium: 'px-3 py-2 min-h-[44px] text-sm',
    inputSmall: 'px-2 py-1.5 min-h-[36px] text-xs',
    input: 'bg-medium-bg-card border-medium-border text-medium-text-primary placeholder-medium-text-muted',
    
    // Card interactions with hover states
    cardBase: 'bg-medium-bg-card border border-medium-border rounded-lg transition-all duration-200',
    cardHover: 'hover:border-medium-accent-green/40 hover:shadow-md hover:-translate-y-0.5',
    cardClickable: 'cursor-pointer hover:border-medium-accent-green/60 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]',
    
    // Link styles
    link: 'text-medium-accent-green hover:text-medium-accent-green/80 transition-colors duration-200',
    linkUnderline: 'underline decoration-2 underline-offset-2 hover:decoration-medium-accent-green/60',
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

  // Spacing - Mobile-first approach with enhanced consistency
  spacing: {
    // Section spacing - Consistent vertical rhythm with large screen optimization
    section: 'py-6 md:py-8 lg:py-12 xl:py-10 2xl:py-8',          // Reduced on very large screens
    sectionLarge: 'py-8 md:py-12 lg:py-16 xl:py-14 2xl:py-12',   // Controlled growth
    sectionSmall: 'py-4 md:py-6 lg:py-8 xl:py-6',                // Compact spacing
    
    // Card spacing - Consistent internal padding
    card: 'p-4 md:p-6 lg:p-8 xl:p-6 2xl:p-5',                   // Optimized for readability
    cardSmall: 'p-3 md:p-4 lg:p-5 xl:p-4',                      // Compact cards
    cardLarge: 'p-6 md:p-8 lg:p-10 xl:p-8 2xl:p-6',             // Large but controlled
    
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
    
    // Medium buttons - Default size
    primary: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonPrimary
    ),
    secondary: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonSecondary
    ),
    ghost: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonGhost
    ),
    danger: combineClasses(
      themeClasses.interactive.buttonBase,
      themeClasses.interactive.buttonMedium,
      themeClasses.interactive.buttonDanger
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

export default themeClasses;
