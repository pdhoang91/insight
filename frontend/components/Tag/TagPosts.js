'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import MasonryPostGrid from '../Category/MasonryPostGrid';

const TagPosts = ({ tagName, posts, totalCount, isLoading, isError, setSize, isReachingEnd }) => {
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
          {t('common.error')}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.78rem',
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
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}
      >
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          marginBottom: '0.5rem',
        }}>
          Tag
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', flexWrap: 'wrap' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            lineHeight: 1.1,
            margin: 0,
          }}>
            #{tagName}
          </h1>

          {totalCount > 0 && (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}>
              {totalCount} {t('category.articles')}
            </span>
          )}
        </div>
      </motion.section>

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
