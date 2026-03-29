'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CategorySkeletonLoader = () => {
  // Create skeleton pattern matching the Bento grid layout
  const skeletonItems = [
    { size: 'large', span: 'col-span-2 row-span-2' },   // Featured card
    { size: 'medium', span: 'col-span-2 row-span-1' },  // Popular card 1
    { size: 'small', span: 'col-span-1 row-span-1' },   // Regular card 1
    { size: 'small', span: 'col-span-1 row-span-1' },   // Regular card 2
    { size: 'medium', span: 'col-span-2 row-span-1' },  // Popular card 2
    { size: 'small', span: 'col-span-1 row-span-1' },   // Regular card 3
    { size: 'small', span: 'col-span-1 row-span-1' },   // Regular card 4
  ];

  return (
    <div className="w-full max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(200px,auto)]">
        {skeletonItems.map((item, index) => (
          <motion.div
            key={index}
            className={`${item.span} h-full`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: index * 0.1
            }}
          >
            <div className="h-full bg-[var(--bg-elevated)]/60 backdrop-blur-sm rounded-[2.5rem] 
                           border border-[var(--border)] 
                           shadow-[0_20px_40px_-15px_rgba(26,20,16,0.05)]
                           p-8 animate-pulse">
              
              {/* Content skeleton */}
              <div className="space-y-4">
                {/* Title skeleton */}
                <motion.div 
                  className={`bg-[var(--bg-elevated)] rounded-full ${
                    item.size === 'large' ? 'h-8 w-3/4' : 
                    item.size === 'medium' ? 'h-6 w-2/3' : 'h-5 w-1/2'
                  }`}
                  animate={{
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1
                  }}
                />
                
                {/* Description skeleton */}
                <div className="space-y-2">
                  <motion.div 
                    className="bg-[var(--bg-elevated)] rounded-full h-4 w-full"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.1 + 0.2
                    }}
                  />
                  <motion.div 
                    className="bg-[var(--bg-elevated)] rounded-full h-4 w-4/5"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.1 + 0.4
                    }}
                  />
                  {item.size === 'large' && (
                    <motion.div 
                      className="bg-[var(--bg-elevated)] rounded-full h-4 w-3/5"
                      animate={{
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.1 + 0.6
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Bottom row skeleton */}
              <div className="flex items-center justify-between mt-8">
                <motion.div 
                  className="bg-[var(--bg-elevated)] rounded-full h-3 w-20"
                  animate={{
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.1 + 0.8
                  }}
                />
                <motion.div 
                  className="bg-[var(--bg-elevated)] rounded-full h-6 w-6"
                  animate={{
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.1 + 1
                  }}
                />
              </div>

              {/* Floating indicator for large card */}
              {item.size === 'large' && (
                <motion.div 
                  className="absolute top-6 right-6 w-3 h-3 bg-[var(--bg-elevated)] rounded-full"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1 + 1.2
                  }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading indicator dots */}
      <div className="flex justify-center mt-12 space-x-2">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-[var(--border-mid)]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySkeletonLoader;