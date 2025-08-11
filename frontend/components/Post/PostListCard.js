// components/Post/PostListCard.js
import React from 'react';
import PostItemCard from './PostItemCard';
import ErrorState from '../Shared/ErrorState';
import EmptyState from '../Shared/EmptyState';
import PostSkeleton from '../Shared/PostSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostListCard = ({ posts, isLoading, isError, setSize, isReachingEnd }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <PostSkeleton key={index} variant="card" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={`loading-${index}`} variant="card" />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <PostItemCard key={`${post.id}-${index}`} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default PostListCard; 