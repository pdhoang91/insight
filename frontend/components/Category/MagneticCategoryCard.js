'use client';

import React, { useRef, memo, useMemo } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import SpotlightBorder from '../UI/SpotlightBorder';
import { useAdaptiveAnimationConfig, useDebouncedAnimation } from '../UI/PerformanceOptimizer';

const MagneticCategoryCard = memo(({ 
  category, 
  size = 'medium',
  index = 0,
  showPerpetualMotion = false,
  animationConfig
}) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Adaptive animation configuration based on device capabilities
  const adaptiveConfig = useAdaptiveAnimationConfig();
  const config = animationConfig || adaptiveConfig;
  
  // Use adaptive spring physics
  const springConfig = config.springConfig;
  
  // Conditional magnetic effects based on performance
  const rotateX = useSpring(
    useTransform(y, [-100, 100], config.reduceComplexity ? [2, -2] : [5, -5]), 
    springConfig
  );
  const rotateY = useSpring(
    useTransform(x, [-100, 100], config.reduceComplexity ? [-2, 2] : [-5, 5]), 
    springConfig
  );
  
  // Debounced mouse move for performance on low-end devices
  const debouncedMouseMove = useDebouncedAnimation((event) => {
    if (!cardRef.current || !config.shouldAnimate) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Reduced strength for low-end devices
    const baseStrength = size === 'large' ? 0.3 : size === 'medium' ? 0.2 : 0.15;
    const strength = config.reduceComplexity ? baseStrength * 0.5 : baseStrength;
    
    x.set((event.clientX - centerX) * strength);
    y.set((event.clientY - centerY) * strength);
  }, config.reduceComplexity ? 16 : 0); // 16ms debounce for low-end devices
  
  const handleMouseMove = useMemo(() => {
    if (config.reduceComplexity) {
      return debouncedMouseMove;
    }
    return (event) => {
      if (!cardRef.current || !config.shouldAnimate) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const strength = size === 'large' ? 0.3 : size === 'medium' ? 0.2 : 0.15;
      x.set((event.clientX - centerX) * strength);
      y.set((event.clientY - centerY) * strength);
    };
  }, [config.reduceComplexity, config.shouldAnimate, debouncedMouseMove, size, x, y]);

  const handleMouseLeave = () => {
    if (config.shouldAnimate) {
      x.set(0);
      y.set(0);
    }
  };

  // Size configurations
  const sizeClasses = {
    small: 'col-span-1 row-span-1 p-6',
    medium: 'col-span-2 row-span-1 p-8', 
    large: 'col-span-2 row-span-2 p-10'
  };

  const textSizes = {
    small: { title: 'text-lg', desc: 'text-sm', count: 'text-xs' },
    medium: { title: 'text-xl', desc: 'text-base', count: 'text-sm' },
    large: { title: 'text-3xl', desc: 'text-lg', count: 'text-base' }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
      }}
      transition={{
        ...springConfig,
        delay: index * (config.staggerDelay || 0.1),
      }}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      className={`${sizeClasses[size]} h-full`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      whileTap={{
        scale: 0.98,
        transition: { type: "spring", stiffness: 400, damping: 30 }
      }}
    >
      <SpotlightBorder 
        className="h-full"
        intensity={size === 'large' ? 0.4 : 0.3}
        radius={size === 'large' ? 400 : 300}
      >
        <Link
          href={`/category/${category.name.toLowerCase()}`}
          className="block h-full bg-white/80 backdrop-blur-sm rounded-[2.5rem] 
                     border border-slate-200/50 
                     shadow-[0_20px_40px_-15px_rgba(26,20,16,0.05)]
                     transition-all duration-300 ease-out
                     hover:shadow-[0_25px_50px_-12px_rgba(26,20,16,0.08)]
                     hover:bg-white/90
                     group relative overflow-hidden"
        >
          {/* Background Pattern for Large Cards */}
          {size === 'large' && (
            <div className="absolute inset-0 opacity-[0.02]">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern 
                    id={`grain-${category.id}`} 
                    x="0" 
                    y="0" 
                    width="4" 
                    height="4" 
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="0.5" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grain-${category.id})`} />
              </svg>
            </div>
          )}

          <div className="relative z-10 h-full flex flex-col justify-between p-8">
            <div className="space-y-4">
              <motion.h3 
                className={`font-display font-bold tracking-tight text-slate-900 
                           ${textSizes[size].title} leading-tight
                           group-hover:text-[var(--accent)] transition-colors duration-300`}
                animate={showPerpetualMotion && config.perpetualMotion ? {
                  y: [0, -2, 0],
                } : {}}
                transition={showPerpetualMotion && config.perpetualMotion ? {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                {category.name}
              </motion.h3>
              
              <p className={`font-body text-slate-600 ${textSizes[size].desc} 
                            leading-relaxed max-w-[65ch]`}>
                {category.description || 'Khám phá các bài viết trong danh mục này'}
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <motion.span 
                className={`font-display font-semibold tracking-wide uppercase
                           text-slate-400 ${textSizes[size].count}`}
                animate={showPerpetualMotion && config.perpetualMotion ? {
                  opacity: [0.6, 1, 0.6],
                } : {}}
                transition={showPerpetualMotion && config.perpetualMotion ? {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                {category.post_count || 0} bài viết
              </motion.span>
              
              <motion.div
                className="text-2xl text-[var(--accent)] opacity-0 
                           group-hover:opacity-100 translate-x-[-8px] 
                           group-hover:translate-x-0 transition-all duration-300"
                animate={showPerpetualMotion && config.perpetualMotion ? {
                  x: [0, 4, 0],
                } : {}}
                transition={showPerpetualMotion && config.perpetualMotion ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                →
              </motion.div>
            </div>

            {/* Perpetual floating indicator for large cards */}
            {size === 'large' && showPerpetualMotion && config.perpetualMotion && (
              <motion.div
                className="absolute top-6 right-6 w-3 h-3 bg-[var(--accent)] rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
        </Link>
      </SpotlightBorder>
    </motion.div>
  );
});

MagneticCategoryCard.displayName = 'MagneticCategoryCard';

export default MagneticCategoryCard;