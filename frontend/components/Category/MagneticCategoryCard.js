'use client';

import React, { useRef, memo } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';

const MagneticCategoryCard = memo(({ category, size = 'medium', index = 0 }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(y, [-100, 100], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(x, [-100, 100], [-3, 3]), springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const strength = size === 'large' ? 0.25 : 0.15;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const colSpan = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
  }[size];

  const padding = {
    small: '1.5rem',
    medium: '2rem',
    large: '2.5rem',
  }[size];

  const titleSize = {
    small: '1rem',
    medium: '1.2rem',
    large: '1.75rem',
  }[size];

  return (
    <motion.div
      ref={cardRef}
      className={colSpan}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.06 }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.015, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={`/category/${category.name.toLowerCase()}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          padding,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          textDecoration: 'none',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        className="group"
      >
        <div>
          <motion.h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              fontSize: titleSize,
              transition: 'color 0.2s',
            }}
            className="group-hover:text-[var(--accent)]"
          >
            {category.name}
          </motion.h3>

          {category.description && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: size === 'large' ? '0.95rem' : '0.85rem',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              maxWidth: '52ch',
            }}>
              {category.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}>
            {category.post_count || 0} bài viết
          </span>

          <motion.span
            style={{ color: 'var(--accent)', opacity: 0 }}
            className="group-hover:opacity-100"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight size={16} weight="bold" />
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
});

MagneticCategoryCard.displayName = 'MagneticCategoryCard';
export default MagneticCategoryCard;
