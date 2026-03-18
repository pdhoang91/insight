'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

// Performance monitoring hook
export const useAnimationPerformance = (animationName = 'animation') => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  
  const measureFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    if (delta >= 1000) {
      fpsRef.current = Math.round((frameCountRef.current * 1000) / delta);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development' && fpsRef.current < 55) {
        console.warn(`${animationName} FPS below 55: ${fpsRef.current}`);
      }
    }
    
    frameCountRef.current++;
  }, [animationName]);

  useEffect(() => {
    let animationId;
    
    const animate = () => {
      measureFPS();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [measureFPS]);

  return fpsRef.current;
};

// Optimized motion value hook with cleanup
export const useOptimizedMotionValue = (initialValue = 0) => {
  const motionValueRef = useRef(initialValue);
  const listenersRef = useRef(new Set());
  const isReducedMotion = useReducedMotion();

  const set = useCallback((value) => {
    if (isReducedMotion) return;
    
    motionValueRef.current = value;
    listenersRef.current.forEach(listener => listener(value));
  }, [isReducedMotion]);

  const get = useCallback(() => motionValueRef.current, []);

  const onChange = useCallback((listener) => {
    listenersRef.current.add(listener);
    
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.clear();
    };
  }, []);

  return { set, get, onChange };
};

// Device capability detection
export const useDeviceCapabilities = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') return { isLowEnd: false, isMobile: false };
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detect low-end devices
    const isLowEnd = 
      navigator.hardwareConcurrency <= 2 || // Few CPU cores
      navigator.deviceMemory <= 2 || // Low RAM
      isMobile; // Mobile devices generally need lighter animations
    
    return { isLowEnd, isMobile };
  }, []);
};

// Adaptive animation configuration
export const useAdaptiveAnimationConfig = () => {
  const { isLowEnd, isMobile } = useDeviceCapabilities();
  const isReducedMotion = useReducedMotion();

  return useMemo(() => {
    if (isReducedMotion) {
      return {
        shouldAnimate: false,
        springConfig: { duration: 0 },
        staggerDelay: 0,
        perpetualMotion: false
      };
    }

    if (isLowEnd || isMobile) {
      return {
        shouldAnimate: true,
        springConfig: { 
          type: "spring", 
          stiffness: 200, // Higher stiffness for snappier, shorter animations
          damping: 35,    // Higher damping to settle faster
          mass: 0.3       // Lower mass for lighter feel
        },
        staggerDelay: 0.03, // Reduced stagger
        perpetualMotion: false, // Disable CPU-intensive perpetual animations
        reduceComplexity: true
      };
    }

    // High-end devices get full experience
    return {
      shouldAnimate: true,
      springConfig: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20, 
        mass: 0.5 
      },
      staggerDelay: 0.08,
      perpetualMotion: true,
      reduceComplexity: false
    };
  }, [isLowEnd, isMobile, isReducedMotion]);
};

// Performance-optimized intersection observer
export const useOptimizedIntersectionObserver = (callback, options = {}) => {
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const observe = useCallback((element) => {
    if (!element || observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          callbackRef.current(entry);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);
    observerRef.current = observer;
    elementRef.current = element;
  }, [options]);

  const unobserve = useCallback(() => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
      observerRef.current.disconnect();
      observerRef.current = null;
      elementRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return unobserve;
  }, [unobserve]);

  return { observe, unobserve };
};

// Debounced animation trigger for performance
export const useDebouncedAnimation = (callback, delay = 100) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Memory-efficient animation loop manager
export const useAnimationLoop = (callback, shouldRun = true) => {
  const callbackRef = useRef(callback);
  const frameIdRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const startLoop = useCallback(() => {
    if (isRunningRef.current) return;
    
    isRunningRef.current = true;
    
    const animate = (timestamp) => {
      if (!isRunningRef.current) return;
      
      callbackRef.current(timestamp);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    frameIdRef.current = requestAnimationFrame(animate);
  }, []);

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (shouldRun) {
      startLoop();
    } else {
      stopLoop();
    }
    
    return stopLoop;
  }, [shouldRun, startLoop, stopLoop]);

  return { startLoop, stopLoop };
};

// Component performance wrapper
export const withPerformanceOptimization = (Component) => {
  const OptimizedComponent = (props) => {
    const config = useAdaptiveAnimationConfig();
    
    return (
      <Component 
        {...props} 
        animationConfig={config}
        __optimized={true}
      />
    );
  };
  
  OptimizedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

export default {
  useAnimationPerformance,
  useOptimizedMotionValue,
  useDeviceCapabilities,
  useAdaptiveAnimationConfig,
  useOptimizedIntersectionObserver,
  useDebouncedAnimation,
  useAnimationLoop,
  withPerformanceOptimization
};