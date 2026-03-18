// components/Profile/UserPostsSection.js
import React from 'react';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
import UserPostList from './UserPostList';
import BasePostItem from '../Post/BasePostItem';

const UserPostsSection = ({ posts, isLoading, isError, setSize, isReachingEnd, isOwner }) => {
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
        Failed to load posts
      </p>
    </div>
  );

  if (isLoading && posts.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '72px 1fr',
            gap: '0 1.5rem',
            paddingBottom: '2rem',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ paddingTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="skeleton-warm" style={{ height: '1.1rem', width: '2.5rem', borderRadius: '2px' }} />
            <div className="skeleton-warm" style={{ height: '0.75rem', width: '1.75rem', borderRadius: '2px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div className="skeleton-warm" style={{ height: '1.1rem', width: '70%', borderRadius: '2px' }} />
            <div className="skeleton-warm" style={{ height: '0.85rem', width: '90%', borderRadius: '2px' }} />
            <div className="skeleton-warm" style={{ height: '0.85rem', width: '55%', borderRadius: '2px' }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <InfiniteScrollWrapper
      items={posts}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={<div className="text-center my-4">Đang tải thêm bài viết...</div>}
      endMessage={<p className="text-center mt-4">Đã tải hết bài viết.</p>}
      className="space-y-0"
    />
  );
};

export default UserPostsSection;
