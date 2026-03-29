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
      <div className="flex items-baseline justify-between mb-5">
        <p className="ui-section-header">
          {t('post.relatedReading')}
        </p>
        <Link
          href="/search"
          className="font-display text-[0.75rem] font-medium tracking-tight text-[var(--text-faint)] transition-colors duration-200 hover:text-[var(--accent)]"
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
