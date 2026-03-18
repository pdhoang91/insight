'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const SpotlightBorder = ({ children, className = '', intensity = 0.3, radius = 300 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  const spotlightStyle = useTransform(
    [x, y],
    ([mouseX, mouseY]) => ({
      background: isHovered 
        ? `radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, rgba(196, 84, 29, ${intensity}) 0%, transparent 70%)`
        : 'transparent',
    })
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Spotlight overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[2.5rem]"
        style={spotlightStyle}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      />
      
      {/* Enhanced border on hover */}
      <motion.div
        className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
        style={{
          border: '1px solid transparent',
          background: isHovered 
            ? 'linear-gradient(var(--bg-surface), var(--bg-surface)) padding-box, linear-gradient(135deg, rgba(196, 84, 29, 0.4), transparent 50%, rgba(196, 84, 29, 0.4)) border-box'
            : 'none'
        }}
        animate={{
          opacity: isHovered ? 1 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      />
    </div>
  );
};

export default SpotlightBorder;