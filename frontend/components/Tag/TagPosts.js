'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import MasonryPostGrid from '../Category/MasonryPostGrid';

const TagPosts = ({ tagName, posts, isLoading, isError, setSize, isReachingEnd }) => {
  const t = useTranslations();

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center py-16 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.75rem',
          }}>
            {t('common.error')}
          </h3>
          <motion.button
            onClick={() => window.location.reload()}
            whileTap={{ scale: 0.97 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-inverse)',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '2px',
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
            }}
          >
            {t('common.retry')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          marginBottom: '0.5rem',
        }}>
          Tag
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          lineHeight: 1.15,
        }}>
          #{tagName}
        </h1>
      </motion.div>

      {/* Post grid */}
      <MasonryPostGrid
        posts={posts}
        isLoading={isLoading}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </div>
  );
};

export default TagPosts;
