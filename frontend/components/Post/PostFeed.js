'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import MasonryPostGrid from '../Category/MasonryPostGrid';
import ErrorState from '../UI/ErrorState';

/**
 * Shared feed layout used by CategoryPosts and TagPosts.
 * Renders an optional header slot above a MasonryPostGrid.
 *
 * @param {{
 *   header?: React.ReactNode,
 *   posts: object[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   setSize: Function,
 *   isReachingEnd: boolean,
 *   errorTitle?: string,
 *   errorMessage?: string,
 * }} props
 */
const PostFeed = ({
  header = null,
  posts,
  isLoading,
  isError,
  setSize,
  isReachingEnd,
  errorTitle,
  errorMessage,
}) => {
  const t = useTranslations();

  if (isError) {
    return (
      <ErrorState
        title={errorTitle ?? t('common.error')}
        message={errorMessage}
        action={{ label: t('common.retry'), onClick: () => window.location.reload() }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {header}
      <MasonryPostGrid
        posts={posts}
        isLoading={isLoading}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </div>
  );
};

export default PostFeed;
