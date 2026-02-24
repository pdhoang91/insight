// components/Post/PostList.js
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import BasePostItem from './BasePostItem';

const PostList = ({
  posts,
  isLoading,
  isError,
  setSize,
  isReachingEnd,
  variant = 'default',
  skipFirst = false,
  className = '',
}) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize((prev) => prev + 1);
    }
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <h3 className="font-serif text-xl font-bold text-medium-text-primary mb-2">Đã xảy ra lỗi</h3>
        <p className="text-medium-text-secondary mb-4">Không thể tải bài viết. Vui lòng thử lại.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-medium-accent-green text-white rounded-full text-sm hover:bg-medium-accent-green/90 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-5">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-medium-bg-secondary rounded w-3/4" />
                <div className="h-4 bg-medium-bg-secondary rounded w-full" />
                <div className="h-4 bg-medium-bg-secondary rounded w-5/6" />
                <div className="flex gap-4 mt-4">
                  <div className="h-3 bg-medium-bg-secondary rounded w-16" />
                  <div className="h-3 bg-medium-bg-secondary rounded w-16" />
                </div>
              </div>
              <div className="w-full lg:w-64 aspect-[16/10] bg-medium-bg-secondary rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="font-serif text-2xl font-bold text-medium-text-primary mb-2">No stories yet</h3>
        <p className="text-medium-text-secondary">Be the first to share your thoughts and experiences.</p>
      </div>
    );
  }

  let flatPosts = posts.flat().filter(Boolean);
  if (skipFirst && flatPosts.length > 0) {
    flatPosts = flatPosts.slice(1);
  }

  return (
    <div className={className}>
      <InfiniteScroll
        dataLength={flatPosts.length}
        next={fetchMore}
        hasMore={!isReachingEnd}
        loader={
          <div className="space-y-6 mt-6">
            {[...Array(2)].map((_, i) => (
              <div key={`l-${i}`} className="animate-pulse">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-medium-bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-medium-bg-secondary rounded w-full" />
                    <div className="h-4 bg-medium-bg-secondary rounded w-5/6" />
                  </div>
                  <div className="w-full lg:w-64 aspect-[16/10] bg-medium-bg-secondary rounded-md" />
                </div>
              </div>
            ))}
          </div>
        }
        endMessage={
          flatPosts.length > 0 && (
            <p className="text-center text-medium-text-muted py-8 mt-6">You've reached the end!</p>
          )
        }
      >
        {flatPosts.map((post, index) => (
          <BasePostItem key={`${post.id}-${index}`} post={post} variant={variant} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default PostList;
