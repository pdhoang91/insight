# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 🚨 Memory Allocation Errors

**Error:**
```
node malloc: *** error for object: pointer being freed was not allocated
node malloc: Double free of object
```

**Solutions:**

1. **Use Optimized Dev Script:**
   ```bash
   npm run dev:optimized
   ```

2. **Clean Build Cache:**
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Increase Node.js Memory Limit:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run dev
   ```

4. **Check System Resources:**
   ```bash
   # Check available memory
   free -h  # Linux
   vm_stat  # macOS
   ```

### 🔄 Build Issues

**Error:**
```
Module not found: Can't resolve './components/...'
Type error: File '...' is not a module
```

**Solutions:**

1. **Clear TypeScript Cache:**
   ```bash
   rm -rf .next
   npm run type-check
   ```

2. **Check Import Paths:**
   - Ensure all imports use correct paths
   - Check for circular dependencies
   - Verify file extensions (.tsx, .ts)

3. **Restart TypeScript Server:**
   - In VSCode: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### ⚡ Performance Issues

**Symptoms:**
- Slow page loads
- High memory usage
- Frequent crashes

**Solutions:**

1. **Enable Package Optimization:**
   ```typescript
   // next.config.ts
   experimental: {
     optimizePackageImports: ['framer-motion', 'react-icons'],
   }
   ```

2. **Lazy Load Components:**
   ```typescript
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <LoadingSpinner />,
   });
   ```

3. **Optimize Images:**
   ```typescript
   import Image from 'next/image';
   
   <Image 
     src="/image.jpg" 
     width={500} 
     height={300}
     priority={false} // Only for above-fold images
   />
   ```

### 🎨 Framer Motion Issues

**Error:**
```
ReferenceError: window is not defined
Hydration mismatch
```

**Solutions:**

1. **Use Client Components:**
   ```typescript
   'use client';
   import { motion } from 'framer-motion';
   ```

2. **Conditional Rendering:**
   ```typescript
   import { useEffect, useState } from 'react';
   
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);
   
   if (!mounted) return <div>Loading...</div>;
   ```

3. **Optimize Animations:**
   ```typescript
   // Use transform instead of layout changes
   <motion.div
     animate={{ x: 100 }} // Good
     // animate={{ left: '100px' }} // Avoid
   />
   ```

### 🔐 Authentication Issues

**Error:**
```
localStorage is not defined
Token expired
```

**Solutions:**

1. **Check Client-Side Execution:**
   ```typescript
   useEffect(() => {
     if (typeof window !== 'undefined') {
       const token = localStorage.getItem('token');
       // Handle token
     }
   }, []);
   ```

2. **Handle Token Expiry:**
   ```typescript
   // In auth service
   if (response.status === 401) {
     localStorage.removeItem('token');
     window.location.href = '/login';
   }
   ```

### 📱 Mobile Issues

**Symptoms:**
- Touch events not working
- Layout broken on mobile
- Performance issues

**Solutions:**

1. **Add Touch Event Handlers:**
   ```typescript
   <div
     onTouchStart={handleTouchStart}
     onTouchEnd={handleTouchEnd}
   />
   ```

2. **Check Viewport Meta Tag:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

3. **Test Responsive Breakpoints:**
   ```css
   /* Tailwind breakpoints */
   sm: 640px
   md: 768px
   lg: 1024px
   xl: 1280px
   ```

## 🛠️ Development Environment

### Required Versions
- **Node.js**: 18+ (LTS recommended)
- **npm**: 8+
- **TypeScript**: 5.0+

### Recommended VSCode Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Prettier - Code formatter**

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🔍 Debugging

### Enable Debug Mode
```bash
DEBUG=* npm run dev
```

### Check Bundle Analysis
```bash
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### Performance Profiling
```typescript
// In components
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration);
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

## 🆘 Getting Help

### Check These First
1. **Console Errors** - Open browser DevTools
2. **Network Tab** - Check failed requests
3. **Build Logs** - Look for warnings/errors
4. **TypeScript Errors** - Run `npm run type-check`

### Useful Commands
```bash
# Health check
npm run build && npm run type-check

# Clean everything
rm -rf .next node_modules package-lock.json
npm install

# Debug mode
NODE_ENV=development DEBUG=* npm run dev

# Memory profiling
node --inspect npm run dev
```

### Community Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/

## 🚀 Production Issues

### Deployment Checklist
- [ ] Build passes without errors
- [ ] All environment variables set
- [ ] Images optimized
- [ ] Bundle size under limits
- [ ] Performance tested

### Common Production Errors
1. **Static Export Issues** - Check dynamic routes
2. **API Endpoint Errors** - Verify CORS settings
3. **Asset Loading** - Check public folder structure
4. **Memory Limits** - Increase server resources

---

**Need more help?** Check the documentation files or create an issue with detailed error logs. 