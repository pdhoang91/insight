'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import MagneticCategoryCard from './MagneticCategoryCard';

const BentoGrid = ({ categories = [] }) => {
  const gridLayout = useMemo(() => {
    return categories.map((category, index) => {
      let size = 'small';
      if (index === 0) size = 'large';
      else if (index === 1 || index === 2) size = 'medium';
      else if ((index - 3) % 5 === 0) size = 'medium';
      return { ...category, size, layoutIndex: index };
    });
  }, [categories]);

  if (!categories.length) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: 'var(--text-faint)',
        }}>
          Không tìm thấy danh mục nào
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.1 },
          },
        }}
      >
        {gridLayout.map((item, index) => (
          <MagneticCategoryCard
            key={item.id || item.name}
            category={item}
            size={item.size}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default BentoGrid;
