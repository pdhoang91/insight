// utils/theme/interactive.js — Interaction, effects, animations, icons, patterns

export const interactive = {
  base: 'touch-manipulation transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-medium-accent-green focus-visible:ring-offset-2',
  touchTarget: 'min-h-[44px] min-w-[44px] flex items-center justify-center',

  buttonBase: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  buttonLarge: 'px-6 py-3 min-h-[48px] text-base',
  buttonMedium: 'px-4 py-2 min-h-[44px] text-sm',
  buttonSmall: 'px-3 py-1.5 min-h-[36px] text-xs',

  buttonPrimary: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 focus-visible:ring-medium-accent-green shadow-sm hover:shadow-md',
  buttonSecondary: ' text-medium-text-primary hover:bg-medium-hover border border-medium-border focus-visible:ring-medium-accent-green',
  buttonGhost: 'text-medium-text-secondary hover:text-medium-accent-green hover: focus-visible:ring-medium-accent-green',
  buttonDanger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm hover:shadow-md',

  inputBase: 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medium-accent-green/50 focus:border-medium-accent-green disabled:opacity-50 disabled:cursor-not-allowed',
  inputLarge: 'px-4 py-3 min-h-[48px] text-base',
  inputMedium: 'px-3 py-2 min-h-[44px] text-sm',
  inputSmall: 'px-2 py-1.5 min-h-[36px] text-xs',
  input: 'border-medium-border text-medium-text-primary placeholder-medium-text-muted',

  cardBase: 'rounded-lg shadow-sm transition-all duration-200',
  cardHover: 'hover:shadow-md hover:-translate-y-0.5',
  cardClickable: 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]',

  link: 'text-medium-accent-green hover:text-medium-accent-green/80 transition-colors duration-200',
  linkUnderline: 'underline decoration-2 underline-offset-2 hover:decoration-medium-accent-green/60',
};

export const patterns = {
  loadingState: 'bg-medium-bg-primary flex items-center justify-center',
  errorState: 'bg-medium-bg-primary text-center',
  emptyState: 'bg-medium-bg-primary text-center py-12',
  skeleton: ' animate-pulse',
  avatar: ' border-medium-border rounded-full flex items-center justify-center',
  tag: ' text-medium-text-secondary px-3 py-1 rounded-full text-sm',
};

export const icons = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',

  primary: 'text-medium-text-primary',
  secondary: 'text-medium-text-secondary',
  muted: 'text-medium-text-muted',
  accent: 'text-medium-accent-green',
  interactive: 'text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',

  button: 'transition-all duration-200 group-hover:scale-110',
  clickable: 'cursor-pointer hover:text-medium-accent-green transition-colors duration-200',
  float: 'cursor-pointer transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  pulse: 'cursor-pointer transition-all duration-200',
  magnetic: 'cursor-pointer transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  buttonSm: 'w-4 h-4 text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',
  buttonMd: 'w-5 h-5 text-medium-text-secondary hover:text-medium-accent-green transition-colors duration-200',
  accentSm: 'w-4 h-4 text-medium-accent-green',
  accentMd: 'w-5 h-5 text-medium-accent-green',
};

export const effects = {
  shadow: 'shadow-sm',
  shadowLarge: 'shadow-lg',

  shadowLayered: 'shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]',
  shadowLayeredMd: 'shadow-[0_3px_6px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.12)]',
  shadowLayeredLg: 'shadow-[0_10px_20px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.10)]',
  shadowLayeredXl: 'shadow-[0_15px_35px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.07)]',

  shadowHoverSoft: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.12)]',
  shadowHoverMedium: 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.10)]',
  shadowHoverStrong: 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),0_5px_10px_rgba(0,0,0,0.10)]',

  // Fixed: was green rgba(26,137,23,...) which caused wrong colored shadows on terracotta palette
  shadowAccent: 'shadow-[0_4px_14px_0_var(--accent-shadow,rgba(26,137,23,0.15))]',
  shadowAccentHover: 'hover:shadow-[0_8px_25px_0_var(--accent-shadow,rgba(26,137,23,0.25))]',

  rounded: 'rounded-lg',
  roundedFull: 'rounded-full',
  roundedDynamic: 'rounded-lg hover:rounded-xl transition-all duration-300',

  blur: 'backdrop-blur-md',
  glow: 'shadow-[0_0_20px_var(--accent-shadow,rgba(26,137,23,0.3))]',
  glowSubtle: 'shadow-[0_0_10px_var(--accent-shadow,rgba(26,137,23,0.15))]',
};

export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  scaleIn: 'animate-scale-in',

  hoverLift: 'hover:animate-hover-lift',
  tapScale: 'active:animate-tap-scale',
  focusRing: 'focus:animate-focus-ring',

  microBounce: 'hover:animate-micro-bounce',
  gentleFloat: 'hover:animate-gentle-float',
  subtlePulse: 'hover:animate-subtle-pulse',
  magneticPull: 'hover:animate-magnetic-pull',
  springScale: 'hover:animate-spring-scale',

  bounceSubtle: 'animate-bounce-subtle',
  shake: 'animate-shake',
  pulseGentle: 'animate-pulse-gentle',
  glow: 'animate-glow',

  skeleton: 'animate-skeleton bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary bg-[length:200%_100%]',
  spinSlow: 'animate-spin-slow',
  pingSlow: 'animate-ping-slow',

  smooth: 'transition-all duration-200 ease-out',
  smoothSlow: 'transition-all duration-300 ease-out',
  smoothFast: 'transition-all duration-150 ease-out',
  spring: 'transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  springFast: 'transition-all duration-200 cubic-bezier(0.34, 1.56, 0.64, 1)',
  elastic: 'transition-all duration-400 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const interactions = {
  cardHover: 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  cardHoverSubtle: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 ease-out',
  cardPress: 'active:scale-[0.98] active:shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition-all duration-100',
  cardFloat: 'hover:shadow-[0_15px_35px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.07)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1)',

  buttonHover: 'hover:shadow-[0_8px_25px_var(--accent-shadow,rgba(26,137,23,0.25))] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  buttonHoverSubtle: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 ease-out',
  buttonPress: 'active:scale-95 active:shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition-all duration-100',
  buttonFocus: 'focus:ring-2 focus:ring-medium-accent-green focus:ring-opacity-50 focus:outline-none focus:shadow-[0_0_0_3px_var(--accent-shadow,rgba(26,137,23,0.1))]',
  buttonMagnetic: 'hover:shadow-[0_10px_30px_var(--accent-shadow,rgba(26,137,23,0.3))] hover:-translate-y-1 hover:scale-105 transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  linkHover: 'hover:text-medium-accent-green hover:scale-[1.02] transition-all duration-200 cubic-bezier(0.34, 1.56, 0.64, 1)',
  linkUnderline: 'hover:underline decoration-2 underline-offset-2 hover:decoration-medium-accent-green/80 transition-all duration-200',
  linkFloat: 'hover:text-medium-accent-green hover:-translate-y-0.5 hover:drop-shadow-sm transition-all duration-200 ease-out',

  iconHover: 'hover:scale-110 hover:text-medium-accent-green hover:drop-shadow-sm transition-all duration-200 cubic-bezier(0.34, 1.56, 0.64, 1)',
  iconPress: 'active:scale-95 transition-transform duration-100',
  iconFloat: 'hover:scale-110 hover:text-medium-accent-green hover:-translate-y-0.5 hover:drop-shadow-md transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  iconPulse: 'hover:scale-110 hover:text-medium-accent-green hover:shadow-[0_0_10px_var(--accent-shadow,rgba(26,137,23,0.3))] transition-all duration-200',

  inputFocus: 'focus:ring-2 focus:ring-medium-accent-green focus:border-medium-accent-green focus:shadow-[0_0_0_3px_var(--accent-shadow,rgba(26,137,23,0.1))] transition-all duration-200',
  inputHover: 'hover:border-medium-text-secondary hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-200',
  inputFloating: 'focus:shadow-[0_8px_25px_var(--accent-shadow,rgba(26,137,23,0.15))] focus:-translate-y-0.5 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
};
