'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const BentoGrid = ({ categories = [] }) => {
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
    <div className="w-full max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8 pb-16">
      <motion.div
        className="flex flex-wrap gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.05 },
          },
        }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id || category.name}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
            }}
          >
            <Link
              href={`/category/${category.name.toLowerCase()}`}
              style={{
                display: 'inline-block',
                padding: '0.5rem 1.25rem',
                border: '1px solid var(--border)',
                borderRadius: '9999px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--text)',
                textDecoration: 'none',
                background: 'var(--bg)',
                transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                whiteSpace: 'nowrap',
              }}
              className="hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)]"
            >
              {category.name}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default BentoGrid;
