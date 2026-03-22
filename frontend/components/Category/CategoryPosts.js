'use client';

import React from 'react';
import CategoryPostsHero from './CategoryPostsHero';
import PostFeed from '../Post/PostFeed';
import { useTranslations } from 'next-intl';

const CategoryPosts = ({ categoryName, posts, totalCount, isLoading, isError, setSize, isReachingEnd }) => {
  const t = useTranslations();

  return (
    <PostFeed
      header={<CategoryPostsHero categoryName={categoryName} totalCount={totalCount} />}
      posts={posts}
      isLoading={isLoading}
      isError={isError}
      setSize={setSize}
      isReachingEnd={isReachingEnd}
      errorTitle={t('category.postsErrorTitle')}
      errorMessage={t('category.postsErrorMessage', { categoryName })}
    />
  );
};

export default CategoryPosts;
