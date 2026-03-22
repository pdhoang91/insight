'use client';

import React from 'react';
import CategoryPostsHero from './CategoryPostsHero';
import MasonryPostGrid from './MasonryPostGrid';
import ErrorState from '../UI/ErrorState';
import { useTranslations } from 'next-intl';

const CategoryPosts = ({ categoryName, posts, totalCount, isLoading, isError, setSize, isReachingEnd }) => {
  const t = useTranslations();

  if (isError) {
    return (
      <ErrorState
        title={t('category.postsErrorTitle')}
        message={t('category.postsErrorMessage', { categoryName })}
        action={{ label: t('category.retry'), onClick: () => window.location.reload() }}
      />
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
