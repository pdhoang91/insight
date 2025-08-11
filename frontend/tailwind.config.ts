// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Terminal/Hacker Color Scheme
        'terminal': {
          'black': '#0d1117',
          'dark': '#161b22', 
          'gray': '#21262d',
          'light': '#30363d',
          'border': '#363b42',
        },
        
        // Matrix/Neon Colors (Softer)
        'matrix': {
          'green': '#4ade80',
          'dark-green': '#22c55e',
          'light-green': '#86efac',
          'cyan': '#22d3ee',
          'blue': '#3b82f6',
        },
        
        // Hacker Theme Colors (Softer)
        'hacker': {
          'red': '#ef4444',
          'orange': '#f97316',
          'yellow': '#eab308',
          'purple': '#a855f7',
          'pink': '#ec4899',
        },
        
        // App backgrounds
        'app': '#0d1117',
        'surface': '#161b22', 
        'elevated': '#21262d',
        'card': '#30363d',
        
        // Text colors with hacker aesthetic
        'text-primary': '#f0f6fc',
        'text-secondary': '#7d8590',
        'text-muted': '#656d76',
        'text-accent': '#4ade80',
        'text-warning': '#eab308',
        'text-danger': '#ef4444',
        
        // Border colors  
        'border-primary': '#30363d',
        'border-secondary': '#21262d',
        'border-accent': '#4ade80',
        
        // Brand colors - Softer green theme
        'brand-primary': '#4ade80',
        'brand-primary-hover': '#22c55e',
        'brand-secondary': '#22d3ee',
        'brand-accent': '#86efac',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
        'hacker': ['Share Tech Mono', 'JetBrains Mono', 'monospace'],
        'matrix': ['Orbitron', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'terminal': ['14px', '20px'],
        'code': ['13px', '18px'],
      },
      animation: {
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'terminal-blink': 'terminal-blink 1s infinite',
        'glitch': 'glitch 0.3s infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'scan-line': 'scan-line 2s linear infinite',
        'typing': 'typing 3.5s steps(40, end)',
      },
      keyframes: {
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'terminal-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        'neon-pulse': {
          'from': { 
            textShadow: '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00, 0 0 20px #00ff00'
          },
          'to': { 
            textShadow: '0 0 2px #00ff00, 0 0 5px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00'
          }
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' }
        }
      },
      boxShadow: {
        'neon-green': '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00',
        'neon-cyan': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff',
        'neon-red': '0 0 5px #ff0040, 0 0 10px #ff0040, 0 0 15px #ff0040',
        'terminal': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'terminal': '8px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
}
