'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CategoryPostsHero from './CategoryPostsHero';
import MasonryPostGrid from './MasonryPostGrid';
import { useTranslations } from 'next-intl';

const CategoryPosts = ({ categoryName, posts, totalCount, isLoading, isError, setSize, isReachingEnd }) => {
  const t = useTranslations();

  if (isError) {
    return (
      <motion.div
        style={{ padding: '5rem 0', textAlign: 'center' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          {t('category.postsErrorTitle')}
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
        }}>
          {t('category.postsErrorMessage', { categoryName })}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: 'var(--text-inverse)',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '2px',
            padding: '0.5rem 1.25rem',
            cursor: 'pointer',
          }}
        >
          {t('category.retry')}
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <CategoryPostsHero categoryName={categoryName} totalCount={totalCount} />
      <MasonryPostGrid
        posts={posts}
        isLoading={isLoading}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </div>
  );
};

export default CategoryPosts;
