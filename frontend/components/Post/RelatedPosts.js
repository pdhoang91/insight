// components/Post/RelatedPosts.js
import React from 'react';
import Link from 'next/link';
import BasePostItem from './BasePostItem';
import { useTranslations } from 'next-intl';

const RelatedPosts = ({ posts = [], currentPostId, className = '' }) => {
  const t = useTranslations();
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div className={className}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.66rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            margin: 0,
          }}
        >
          {t('post.relatedReading')}
        </p>
        <Link
          href="/search"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--text-faint)',
            letterSpacing: '-0.01em',
            transition: 'color 0.2s',
          }}
          className="hover:text-[var(--accent)]"
        >
          {t('post.browseAll')}
        </Link>
      </div>

      <div>
        {relatedPosts.map(post => (
          <BasePostItem key={post.id} post={post} variant="horizontal" />
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
