// styles/design-system.js
// Centralized Design System for Consistent Styling

export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary colors
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  
  warning: {
    50: '#fefce8',
    500: '#eab308',
    700: '#a16207',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  
  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
  },
  
  // Font sizes with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  }
};

export const spacing = {
  // Consistent spacing scale
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

// Component Variants
export const componentVariants = {
  // Button variants
  button: {
    primary: {
      base: `bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
      sizes: {
        sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
        md: 'px-4 py-2 text-sm font-medium rounded-md',
        lg: 'px-6 py-3 text-base font-medium rounded-md',
      }
    },
    secondary: {
      base: `bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
      sizes: {
        sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
        md: 'px-4 py-2 text-sm font-medium rounded-md',
        lg: 'px-6 py-3 text-base font-medium rounded-md',
      }
    },
    outline: {
      base: `border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
      sizes: {
        sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
        md: 'px-4 py-2 text-sm font-medium rounded-md',
        lg: 'px-6 py-3 text-base font-medium rounded-md',
      }
    },
    ghost: {
      base: `text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`,
      sizes: {
        sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
        md: 'px-4 py-2 text-sm font-medium rounded-md',
        lg: 'px-6 py-3 text-base font-medium rounded-md',
      }
    }
  },
  
  // Card variants
  card: {
    default: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    elevated: 'bg-white rounded-lg border border-gray-200 shadow-md',
    interactive: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200',
    compact: 'bg-white rounded-md border border-gray-200',
  },
  
  // Input variants
  input: {
    default: 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500',
    error: 'block w-full px-3 py-2 border border-error-500 rounded-md shadow-sm focus:ring-error-500 focus:border-error-500',
    success: 'block w-full px-3 py-2 border border-success-500 rounded-md shadow-sm focus:ring-success-500 focus:border-success-500',
  },
  
  // Badge variants
  badge: {
    primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800',
    secondary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800',
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800',
    error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800',
    gray: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
  }
};

// Utility functions for consistent styling
export const getButtonClasses = (variant = 'primary', size = 'md', disabled = false) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = componentVariants.button[variant]?.base || componentVariants.button.primary.base;
  const sizeClasses = componentVariants.button[variant]?.sizes[size] || componentVariants.button.primary.sizes[size];
  
  return `${baseClasses} ${variantClasses} ${sizeClasses}`;
};

export const getCardClasses = (variant = 'default') => {
  return componentVariants.card[variant] || componentVariants.card.default;
};

export const getInputClasses = (variant = 'default') => {
  return componentVariants.input[variant] || componentVariants.input.default;
};

export const getBadgeClasses = (variant = 'gray') => {
  return componentVariants.badge[variant] || componentVariants.badge.gray;
};

// Animation presets
export const animations = {
  // Framer Motion variants
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  
  // Transition presets
  transitions: {
    fast: { duration: 0.15 },
    normal: { duration: 0.2 },
    slow: { duration: 0.3 },
    spring: { type: 'spring', stiffness: 400, damping: 25 }
  }
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentVariants,
  animations,
  breakpoints,
  getButtonClasses,
  getCardClasses,
  getInputClasses,
  getBadgeClasses,
}; 