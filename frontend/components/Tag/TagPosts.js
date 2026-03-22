'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import PostFeed from '../Post/PostFeed';

const TagHeader = ({ tagName, totalCount }) => {
  const t = useTranslations();
  return (
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
  );
};

const TagPosts = ({ tagName, posts, totalCount, isLoading, isError, setSize, isReachingEnd }) => {
  const t = useTranslations();

  return (
    <PostFeed
      header={<TagHeader tagName={tagName} totalCount={totalCount} />}
      posts={posts}
      isLoading={isLoading}
      isError={isError}
      setSize={setSize}
      isReachingEnd={isReachingEnd}
      errorTitle={t('common.error')}
    />
  );
};

export default TagPosts;
