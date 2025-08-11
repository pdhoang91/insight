// components/Post/PostListCompact.js
import React from 'react';
import CompactPostItem from './CompactPostItem';
import ErrorState from '../Shared/ErrorState';
import EmptyState from '../Shared/EmptyState';
import PostSkeleton from '../Shared/PostSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostListCompact = ({ posts, isLoading, isError, setSize, isReachingEnd }) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize((prevSize) => prevSize + 1);
    }
  };

  // Error State
  if (isError) {
    return (
      <ErrorState 
        title="Failed to load posts"
        message="Something went wrong while fetching the posts. Please check your connection and try again."
      />
    );
  }

  // Initial Loading State
  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <PostSkeleton key={index} variant="compact" />
        ))}
      </div>
    );
  }

  // Empty State
  if (!posts || posts.length === 0) {
    return (
      <EmptyState 
        title="No posts found"
        message="No posts have been published yet. Be the first to share your knowledge with the community!"
        icon="posts"
      />
    );
  }

  return (
    <div className="space-y-6">
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMore}
        hasMore={!isReachingEnd}
        loader={
          <div className="space-y-3 mt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={`loading-${index}`} variant="compact" />
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {posts.map((post, index) => (
            <CompactPostItem key={`${post.id}-${index}`} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default PostListCompact; 