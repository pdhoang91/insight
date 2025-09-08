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
        // Medium 2024 Spacing Scale
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
        
        // Reading-specific spacing
        'reading': '1.5rem',      // 24px - Base reading spacing
        'section': '3rem',        // 48px - Section spacing
        'article': '2rem',        // 32px - Article element spacing
      },
      maxWidth: {
        // Medium 2024 Layout Widths
        'article': '680px',       // Medium's optimal reading width
        'container': '1200px',    // Main container
        'sidebar': '320px',       // Sidebar width
        'content': '800px',       // Content area (article + padding)
        'wide': '1400px',         // Wide container for special layouts
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slideUp': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      boxShadow: {
        // Medium 2024 Shadow System
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card-active': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'medium': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'floating': '0 8px 32px rgba(0, 0, 0, 0.12)',
        
        // Focus states
        'focus': '0 0 0 3px var(--medium-focus)',
        'focus-visible': '0 0 0 2px var(--medium-accent-green)',
      },
      
      borderRadius: {
        // Medium 2024 Border Radius
        'medium': '8px',
        'card': '12px',
        'button': '24px',
      },

    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
}
