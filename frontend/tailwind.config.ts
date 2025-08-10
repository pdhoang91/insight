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
        // App backgrounds
        'app': '#111827',
        'surface': '#1f2937', 
        'elevated': '#374151',
        
        // Text colors
        'text-primary': '#f9fafb',
        'text-secondary': '#d1d5db',
        'text-muted': '#9ca3af',
        
        // Border colors  
        'border-primary': '#374151',
        'border-secondary': '#4b5563',
        
        // Brand colors
        'brand-primary': '#10b981',
        'brand-primary-hover': '#059669',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
