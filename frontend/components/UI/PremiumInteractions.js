'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

// Magnetic Button with advanced cursor tracking
export const MagneticButton = ({ 
  children, 
  className = '', 
  intensity = 0.3,
  springConfig = { stiffness: 300, damping: 30, mass: 0.5 },
  ...props 
}) => {
  const buttonRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  const rotateX = useTransform(y, [-50, 50], [2, -2]);
  const rotateY = useTransform(x, [-50, 50], [-2, 2]);

  const handleMouseMove = useCallback((event) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) * intensity;
    const deltaY = (event.clientY - centerY) * intensity;
    
    x.set(deltaX);
    y.set(deltaY);
  }, [x, y, intensity]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...props}
    >
      {children}
      
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-inherit">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                       translate-x-[-100%] hover:translate-x-[100%] 
                       transition-transform duration-1000 ease-out" />
      </div>
    </motion.button>
  );
};

// Directional Hover Button - fill enters from mouse direction
export const DirectionalButton = ({ 
  children, 
  className = '', 
  fillColor = 'rgba(196, 84, 29, 0.1)',
  ...props 
}) => {
  const buttonRef = useRef(null);
  const [hoverDirection, setHoverDirection] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const getDirection = useCallback((event) => {
    if (!buttonRef.current) return 'left';
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'bottom' : 'top';
    }
  }, []);

  const handleMouseEnter = useCallback((event) => {
    const direction = getDirection(event);
    setHoverDirection(direction);
    setIsHovered(true);
  }, [getDirection]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const getTransformOrigin = () => {
    switch (hoverDirection) {
      case 'left': return 'left center';
      case 'right': return 'right center';
      case 'top': return 'center top';
      case 'bottom': return 'center bottom';
      default: return 'center center';
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...props}
    >
      {children}
      
      {/* Directional fill overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: fillColor,
          transformOrigin: getTransformOrigin(),
        }}
        initial={{ scaleX: 0, scaleY: 0 }}
        animate={{ 
          scaleX: isHovered ? 1 : 0,
          scaleY: isHovered ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.button>
  );
};

// Shimmer Loading Card
export const ShimmerCard = ({ 
  className = '', 
  lines = 3, 
  showAvatar = false,
  aspectRatio = 'aspect-[4/3]'
}) => {
  return (
    <div className={`bg-[var(--bg-surface)] rounded-[var(--border-radius-xl)]
                    border border-[var(--border)] overflow-hidden
                    shadow-[var(--shadow-md)] ${className}`}>

      {/* Image placeholder with shimmer */}
      <div className={`${aspectRatio} bg-[var(--bg-elevated)] relative overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent
                     via-[var(--bg-elevated)]/60 to-transparent w-full"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content placeholder */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <motion.div
            className="h-4 bg-[var(--bg-elevated)] rounded-full w-3/4 relative overflow-hidden"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent
                         via-[var(--border-mid)] to-transparent w-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
          </motion.div>
        </div>

        {/* Description lines */}
        <div className="space-y-2">
          {[...Array(lines)].map((_, i) => (
            <motion.div
              key={i}
              className={`h-3 bg-[var(--bg-elevated)] rounded-full relative overflow-hidden ${
                i === lines - 1 ? 'w-2/3' : 'w-full'
              }`}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent
                           via-[var(--border-mid)] to-transparent w-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 + i * 0.1 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer with avatar if needed */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-3">
            {showAvatar && (
              <motion.div
                className="w-8 h-8 bg-[var(--bg-elevated)] rounded-full relative overflow-hidden"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent
                             via-[var(--border-mid)] to-transparent w-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
            )}
            <motion.div
              className="h-2 w-16 bg-[var(--bg-elevated)] rounded-full relative overflow-hidden"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent
                           via-[var(--border-mid)] to-transparent w-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: 0.6 }}
              />
            </motion.div>
          </div>

          <motion.div
            className="w-6 h-6 bg-[var(--bg-elevated)] rounded-full relative overflow-hidden"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent
                         via-[var(--border-mid)] to-transparent w-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.7 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Floating Action Button with expand animation
export const FloatingActionButton = ({ 
  children, 
  actions = [], 
  className = '',
  expandDirection = 'up'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionPosition = (index, total) => {
    const spacing = 60;
    const angle = expandDirection === 'radial' 
      ? (index / total) * Math.PI * 2 
      : Math.PI / 2; // Up direction

    if (expandDirection === 'radial') {
      return {
        x: Math.cos(angle) * spacing,
        y: Math.sin(angle) * spacing,
      };
    } else {
      return {
        x: 0,
        y: -(index + 1) * spacing,
      };
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Action buttons */}
      <AnimatePresence>
        {isExpanded && actions.map((action, index) => {
          const position = getActionPosition(index, actions.length);
          
          return (
            <motion.button
              key={index}
              className="absolute w-12 h-12 bg-white shadow-lg rounded-full 
                         flex items-center justify-center text-slate-700
                         hover:bg-slate-50 hover:shadow-xl transition-colors duration-200"
              style={{ 
                bottom: '100%',
                left: '50%',
                marginLeft: '-24px',
                marginBottom: '8px'
              }}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: position.x,
                y: position.y
              }}
              exit={{ 
                opacity: 0, 
                scale: 0,
                x: 0,
                y: 0
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.05
              }}
              onClick={action.onClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {action.icon}
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        className="w-14 h-14 bg-[var(--accent)] text-white shadow-lg rounded-full 
                   flex items-center justify-center hover:bg-[var(--accent-dark)]
                   transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {children}
      </motion.button>
    </div>
  );
};

export default {
  MagneticButton,
  DirectionalButton,
  ShimmerCard,
  FloatingActionButton
};