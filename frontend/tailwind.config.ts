// tailwind.config.ts - Medium 2024 Design System
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medium 2024 Color System (CSS Variables)
        'medium': {
          // Backgrounds
          'bg-primary': 'var(--medium-bg-primary)',
          'bg-secondary': 'var(--medium-bg-secondary)',
          'bg-card': 'var(--medium-bg-card)',
          'bg-elevated': 'var(--medium-bg-elevated)',
          
          // Text Colors
          'text-primary': 'var(--medium-text-primary)',
          'text-secondary': 'var(--medium-text-secondary)',
          'text-muted': 'var(--medium-text-muted)',
          'text-accent': 'var(--medium-text-accent)',
          
          // Accent Colors
          'accent-green': 'var(--medium-accent-green)',
          'accent-gray': 'var(--medium-accent-gray)',
          'accent-blue': 'var(--medium-accent-blue)',
          
          // Borders & Dividers
          'border': 'var(--medium-border)',
          'border-light': 'var(--medium-border-light)',
          'divider': 'var(--medium-divider)',
          
          // Interactive States
          'hover': 'var(--medium-hover)',
          'active': 'var(--medium-active)',
          'focus': 'var(--medium-focus)',
        },
        
        // Semantic Colors (Medium-inspired)
        'success': {
          DEFAULT: '#1A8917',
          light: '#4CAF50',
          dark: '#0F5132'
        },
        'warning': {
          DEFAULT: '#F59E0B',
          light: '#FFC107',
          dark: '#E65100'
        },
        'error': {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C'
        },
        'info': {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8'
        },
      },
      fontFamily: {
        // Medium 2024 Typography Stack
        'serif': ['Charter', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', 'monospace'],
        
        // Reading-optimized fonts
        'reading': ['Charter', 'Georgia', 'serif'],
        'ui': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Medium 2024 Typography Scale
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'article-title': ['42px', { lineHeight: '1.2', letterSpacing: '-0.003em', fontWeight: '700' }],
        'article-title-mobile': ['32px', { lineHeight: '1.25', letterSpacing: '-0.003em', fontWeight: '700' }],
        'heading-1': ['36px', { lineHeight: '1.2', letterSpacing: '-0.002em', fontWeight: '700' }],
        'heading-2': ['28px', { lineHeight: '1.3', letterSpacing: '-0.002em', fontWeight: '600' }],
        'heading-3': ['24px', { lineHeight: '1.3', letterSpacing: '-0.001em', fontWeight: '600' }],
        'subtitle': ['22px', { lineHeight: '1.4', fontWeight: '400' }],
        'body-large': ['20px', { lineHeight: '1.58', fontWeight: '400' }],
        'body': ['18px', { lineHeight: '1.58', fontWeight: '400' }],
        'body-small': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        
        // Interactive elements
        'button': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        'label': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        // CSS Custom Properties Integration
        'xs': 'var(--spacing-xs)',     // 4px
        'sm': 'var(--spacing-sm)',     // 8px  
        'md': 'var(--spacing-md)',     // 12px
        'lg': 'var(--spacing-lg)',     // 16px
        'xl': 'var(--spacing-xl)',     // 24px
        '2xl': 'var(--spacing-2xl)',   // 32px
        '3xl': 'var(--spacing-3xl)',   // 48px
        '4xl': 'var(--spacing-4xl)',   // 64px
        
        // Semantic spacing
        'section': 'var(--spacing-section)',   // 48px
        'card': 'var(--spacing-card)',         // 24px
        'gap': 'var(--spacing-gap)',           // 24px
        'reading': 'var(--reading-spacing)',   // 24px
        
        // Legacy support for existing values
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
      },
      maxWidth: {
        // Medium 2024 Layout Widths - Optimized for large screens
        'article': '680px',       // Medium's optimal reading width
        'container': '1140px',    // Main container (reduced from 1200px)
        'sidebar': '320px',       // Sidebar width
        'content': '800px',       // Content area (article + padding)
        'wide': '1280px',         // Wide container (reduced from 1400px)
        'reading': '720px',       // Reading-optimized width
        'compact': '960px',       // Compact layout for forms/profiles
      },
      
      // Standardized responsive breakpoints - Optimized for better scaling
      screens: {
        'sm': '640px',   // Mobile landscape / small tablets
        'md': '768px',   // Tablets
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Large desktop
        '2xl': '1440px', // Extra large desktop (reduced from 1536px)
        
        // Custom breakpoints for specific needs
        'mobile': {'max': '767px'},      // Mobile only
        'tablet': {'min': '768px', 'max': '1023px'}, // Tablet only
        'desktop': {'min': '1024px'},    // Desktop and up
        'touch': {'max': '1023px'},      // Touch devices (mobile + tablet)
        'large': {'min': '1440px'},      // Very large screens
      },
      
      animation: {
        // Existing animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        
        // Advanced micro-animations
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        
        // Loading animations
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        
        // Interactive animations
        'hover-lift': 'hoverLift 0.2s ease-out',
        'tap-scale': 'tapScale 0.1s ease-out',
        'focus-ring': 'focusRing 0.2s ease-out',
      },
      keyframes: {
        // Existing keyframes
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slideUp': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        
        // Advanced keyframes
        'scaleIn': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'slideDown': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slideLeft': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slideRight': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'bounceSubtle': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-8px,0)' },
          '70%': { transform: 'translate3d(0,-4px,0)' },
          '90%': { transform: 'translate3d(0,-2px,0)' }
        },
        'pulseGentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(var(--medium-accent-green-rgb), 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(var(--medium-accent-green-rgb), 0.4)' }
        },
        'skeleton': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        },
        'hoverLift': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-2px) scale(1.02)' }
        },
        'tapScale': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' }
        },
        'focusRing': {
          '0%': { boxShadow: '0 0 0 0 rgba(var(--medium-accent-green-rgb), 0.7)' },
          '70%': { boxShadow: '0 0 0 4px rgba(var(--medium-accent-green-rgb), 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(var(--medium-accent-green-rgb), 0)' }
        }
      },
      boxShadow: {
        // CSS Custom Properties Integration
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        
        // Semantic shadows
        'card': 'var(--shadow-sm)',
        'card-hover': 'var(--shadow-md)',
        'card-active': 'var(--shadow-lg)',
        'elevated': 'var(--shadow-md)',
        'floating': 'var(--shadow-xl)',
        
        // Focus states
        'focus': '0 0 0 3px var(--medium-focus)',
        'focus-visible': '0 0 0 2px var(--medium-accent-green)',
      },
      
      borderRadius: {
        // CSS Custom Properties Integration
        'sm': 'var(--border-radius-sm)',     // 4px
        'md': 'var(--border-radius-md)',     // 8px
        'lg': 'var(--border-radius-lg)',     // 12px
        'xl': 'var(--border-radius-xl)',     // 16px
        '2xl': 'var(--border-radius-2xl)',   // 24px
        'full': 'var(--border-radius-full)', // 9999px
        
        // Semantic radius
        'card': 'var(--border-radius-lg)',
        'button': 'var(--border-radius-2xl)',
        'medium': 'var(--border-radius-md)',
      },

    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
