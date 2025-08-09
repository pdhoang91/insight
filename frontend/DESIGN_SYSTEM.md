# 🎨 Insight Design System

## Tổng quan
Design System tập trung để quản lý theme, colors, typography, và components một cách nhất quán.

## 📁 Cấu trúc
```
styles/
├── design-system.css    # Design tokens & component classes
├── globals.css         # Global styles & imports
context/
├── ThemeContext.js     # Theme management
```

## 🎯 Lợi ích
- ✅ **Centralized Theme Management** - Chỉ cần sửa 1 file để thay đổi toàn bộ theme
- ✅ **Consistent Styling** - Tất cả components sử dụng cùng design tokens
- ✅ **Easy Maintenance** - Không cần tìm từng file để update
- ✅ **Scalable** - Dễ dàng thêm themes mới (light mode, custom themes)

## 🎨 CSS Variables (Design Tokens)

### Colors
```css
--color-primary: #10b981        /* Green - Primary actions */
--color-secondary: #3b82f6      /* Blue - Secondary actions */
--color-accent: #f59e0b         /* Yellow - Highlights */
--color-danger: #ef4444         /* Red - Errors, warnings */
```

### Backgrounds
```css
--bg-app: #111827               /* Main app background (gray-900) */
--bg-surface: #1f2937           /* Cards, surfaces (gray-800) */
--bg-elevated: #374151          /* Elevated elements (gray-700) */
--bg-content: #ffffff           /* Content areas (white) */
```

### Text Colors
```css
--text-primary: #f9fafb         /* Primary text on dark */
--text-secondary: #d1d5db       /* Secondary text on dark */
--text-muted: #9ca3af           /* Muted text */
--text-content: #111827         /* Text on white content */
--text-content-secondary: #4b5563 /* Secondary on white */
```

## 🏗️ Component Classes

### Page Layout
```jsx
// ❌ Before - Manual styling
<div className="min-h-screen bg-gray-900">
  <div className="max-w-4xl mx-auto p-6">
    <main className="bg-white text-gray-900 min-h-[80vh] p-8">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Title</h1>
    </main>
  </div>
</div>

// ✅ After - Design System
<div className="page-container">
  <div className="page-content">
    <main className="content-area">
      <h1 className="page-title">Title</h1>
    </main>
  </div>
</div>
```

### Loading States
```jsx
// ❌ Before
<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
  <div className="bg-white text-gray-900 font-mono p-8 max-w-md w-full text-center">
    <div className="animate-pulse">Loading...</div>
  </div>
</div>

// ✅ After
<div className="loading-container">
  <div className="loading-card animate-pulse">
    Loading...
  </div>
</div>
```

### Error States
```jsx
// ❌ Before
<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
  <div className="bg-white text-red-600 font-mono p-8">
    Error message
  </div>
</div>

// ✅ After
<div className="loading-container">
  <div className="error-card">
    Error message
  </div>
</div>
```

### Headers
```jsx
// ❌ Before
<header className="mb-8 pb-6 border-b border-gray-200">
  <h1 className="text-4xl font-bold mb-4 text-gray-900 leading-tight">Title</h1>
  <p className="text-gray-600 font-mono">// subtitle</p>
</header>

// ✅ After
<header className="page-header">
  <h1 className="page-title">Title</h1>
  <p className="page-subtitle tech-comment">subtitle</p>
</header>
```

## 🎛️ Theme Management

### ThemeContext Usage
```jsx
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Wrap app with ThemeProvider
function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

// Use theme in components
function MyComponent() {
  const { theme, toggleTheme, currentTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 🎨 Utility Classes

### Background Classes
```css
.bg-app      /* Main app background */
.bg-surface  /* Card backgrounds */
.bg-elevated /* Elevated elements */
.bg-content  /* Content areas */
```

### Text Classes
```css
.text-primary           /* Primary text on dark */
.text-secondary         /* Secondary text on dark */
.text-muted            /* Muted text */
.text-content          /* Text on white content */
.text-content-secondary /* Secondary on white */
```

### Special Classes
```css
.tech-comment          /* Automatically adds "// " prefix */
.font-mono            /* Monospace font */
.animate-pulse        /* Pulse animation */
```

## 📋 Migration Guide

### Step 1: Replace Page Layouts
```jsx
// Find patterns like this:
className="min-h-screen bg-gray-900"
className="min-h-screen bg-slate-900"

// Replace with:
className="page-container"
```

### Step 2: Replace Content Areas
```jsx
// Find patterns like this:
className="bg-white text-gray-900 min-h-[80vh] p-8"

// Replace with:
className="content-area"
```

### Step 3: Replace Loading States
```jsx
// Find loading patterns and replace with:
<div className="loading-container">
  <div className="loading-card animate-pulse">
    Loading message
  </div>
</div>
```

### Step 4: Replace Headers
```jsx
// Replace header patterns with:
<header className="page-header">
  <h1 className="page-title">Title</h1>
  <p className="page-subtitle tech-comment">subtitle</p>
</header>
```

## 🔧 Customization

### Adding New Colors
```css
/* In design-system.css */
:root {
  --color-custom: #your-color;
}

.text-custom { color: var(--color-custom); }
.bg-custom { background-color: var(--color-custom); }
```

### Adding New Themes
```jsx
// In ThemeContext.js
const themes = {
  dark: { /* existing dark theme */ },
  light: { /* existing light theme */ },
  custom: {
    name: 'custom',
    colors: {
      bgApp: '#your-bg-color',
      textPrimary: '#your-text-color',
      // ... other colors
    }
  }
};
```

## 🚀 Best Practices

### 1. Always Use Design System Classes
```jsx
// ❌ Don't use hardcoded Tailwind classes
<div className="bg-gray-900 text-white p-8">

// ✅ Use design system classes
<div className="bg-app text-primary p-8">
```

### 2. Use CSS Variables for Custom Styles
```jsx
// ❌ Don't use hardcoded colors
<div style={{ backgroundColor: '#111827' }}>

// ✅ Use CSS variables
<div style={{ backgroundColor: 'var(--bg-app)' }}>
```

### 3. Leverage Component Classes
```jsx
// ❌ Don't repeat styling patterns
<div className="bg-white p-6 border border-gray-200 rounded-lg">

// ✅ Use component classes
<div className="card-content">
```

## 📊 Class Reference

### Layout Classes
| Class | Purpose |
|-------|---------|
| `.page-container` | Main page wrapper |
| `.page-content` | Content container with max-width |
| `.content-area` | White content area |

### State Classes
| Class | Purpose |
|-------|---------|
| `.loading-container` | Loading state wrapper |
| `.loading-card` | Loading message card |
| `.error-card` | Error message card |

### Typography Classes
| Class | Purpose |
|-------|---------|
| `.page-title` | Main page title |
| `.page-subtitle` | Page subtitle |
| `.tech-comment` | Technical comment with "//" prefix |

### Interactive Classes
| Class | Purpose |
|-------|---------|
| `.btn-primary` | Primary button |
| `.btn-secondary` | Secondary button |

## 💡 Tips

1. **Theme Changes**: Chỉ cần sửa CSS variables trong `design-system.css` để thay đổi toàn bộ theme
2. **New Components**: Thêm component classes vào `design-system.css` thay vì hardcode styling
3. **Consistency**: Luôn sử dụng design system classes thay vì Tailwind trực tiếp
4. **Maintenance**: Khi cần thay đổi styling, tìm trong `design-system.css` trước 