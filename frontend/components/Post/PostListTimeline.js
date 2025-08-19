// components/Post/PostListTimeline.js
import React from 'react';
import PostItemTimeline from './PostItemTimeline';
import ErrorState from '../Shared/ErrorState';
import EmptyState from '../Shared/EmptyState';
import PostSkeleton from '../Shared/PostSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostListTimeline = ({ posts, isLoading, isError, setSize, isReachingEnd }) => {
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
        {Array.from({ length: 5 }).map((_, index) => (
          <PostSkeleton key={index} variant="timeline" />
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
          <div className="space-y-4 mt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={`loading-${index}`} variant="timeline" />
            ))}
          </div>
        }
      >
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostItemTimeline key={`${post.id}-${index}`} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default PostListTimeline; 