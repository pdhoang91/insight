// components/Profile/UserPostsSection.js
import React from 'react';
import InfiniteScrollWrapper from '../UI/InfiniteScrollWrapper';
import UserPostList from './UserPostList';
import BasePostItem from '../Post/BasePostItem';
import PostSkeleton from '../Post/PostSkeleton';
import { useTranslations } from 'next-intl';

const UserPostsSection = ({ posts, isLoading, isError, setSize, isReachingEnd, isOwner }) => {
  const t = useTranslations();
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize(prevSize => prevSize + 1);
    }
  };

  const renderItem = (post) => {
    if (!post || !post.id) return null;
    return <BasePostItem key={post.id} post={post} variant="profile" showOwnerActions={isOwner} />;
  };

  if (isError) return (
    <div style={{ padding: '3rem 0', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#DC2626', letterSpacing: '-0.01em' }}>
        {t('profile.loadFailed')}
      </p>
    </div>
  );

  if (isLoading && posts.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
    </div>
  );

  return (
    <InfiniteScrollWrapper
      items={posts}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={<div className="text-center my-4">{t('profile.loadingMore')}</div>}
      endMessage={<p className="text-center mt-4">{t('profile.allPostsLoaded')}</p>}
      className="space-y-0"
    />
  );
};

export default UserPostsSection;
