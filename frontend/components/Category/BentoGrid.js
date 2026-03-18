'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticCategoryCard from './MagneticCategoryCard';

const BentoGrid = ({ categories = [] }) => {
  // Create asymmetric layout pattern following DESIGN_VARIANCE=8
  const gridLayout = useMemo(() => {
    if (!categories.length) return [];
    
    const layout = [];
    
    categories.forEach((category, index) => {
      // Asymmetric pattern: 1 large, 2 medium, rest small with variations
      let size = 'small';
      let showPerpetualMotion = false;
      
      if (index === 0) {
        // Featured category - large with perpetual motion
        size = 'large';
        showPerpetualMotion = true;
      } else if (index === 1 || index === 2) {
        // Popular categories - medium size
        size = 'medium';
      } else if ((index - 3) % 5 === 0) {
        // Every 5th subsequent category is medium for asymmetry
        size = 'medium';
      }
      
      layout.push({
        ...category,
        size,
        showPerpetualMotion,
        layoutIndex: index
      });
    });
    
    return layout;
  }, [categories]);

  if (!categories.length) {
    return (
      <div className="text-center py-16">
        <p className="font-body text-slate-500 text-lg">
          Không tìm thấy danh mục nào
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8">
      {/* Asymmetric Bento Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(200px,auto)]"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.2
            }
          }
        }}
      >
        <AnimatePresence mode="wait">
          {gridLayout.map((item, index) => (
            <MagneticCategoryCard
              key={item.id || item.name}
              category={item}
              size={item.size}
              index={index}
              showPerpetualMotion={item.showPerpetualMotion}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Visual Rhythm Indicators */}
      <div className="flex justify-center mt-12 space-x-2">
        {[...Array(Math.min(categories.length, 8))].map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-slate-300"
            animate={{
              backgroundColor: [
                'rgb(203, 213, 225)', // slate-300
                'rgba(196, 84, 29, 0.6)', // accent with opacity
                'rgb(203, 213, 225)'
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BentoGrid;