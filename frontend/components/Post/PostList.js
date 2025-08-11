// components/Post/PostList.js
import React from 'react';
import PostItemTimeline from './PostItemTimeline';
import PostItemList from './PostItemList';
import PostItemCard from './PostItemCard';
import EnhancedPostItem from './EnhancedPostItem';
import CompactPostItem from './CompactPostItem';
import ErrorState from '../Shared/ErrorState';
import EmptyState from '../Shared/EmptyState';
import PostSkeleton from '../Shared/PostSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostList = ({ posts, isLoading, isError, setSize, isReachingEnd, variant = 'enhanced', compact = false }) => {
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
    const skeletonCount = compact ? 4 : variant === 'list' ? 5 : 6;
    const gridClass = variant === 'enhanced' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8'
      : variant === 'list' 
        ? 'space-y-6' 
        : variant === 'compact'
          ? 'space-y-4'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <PostSkeleton key={index} variant={variant} />
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
          variant === 'enhanced' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="enhanced" />
              ))}
            </div>
          ) : variant === 'list' ? (
            <div className="space-y-4 mt-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="list" />
              ))}
            </div>
          ) : variant === 'compact' ? (
            <div className="space-y-3 mt-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="card" />
              ))}
            </div>
          )
        }
      >
        {/* Posts Layout */}
        {variant === 'enhanced' ? (
          // Enhanced Layout - Rich cards with more content
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <EnhancedPostItem key={`${post.id}-${index}`} post={post} variant="enhanced" />
            ))}
          </div>
        ) : variant === 'compact' ? (
          // Compact Layout - For sidebar or dense listings
          <div className="space-y-3">
            {posts.map((post, index) => (
              <CompactPostItem key={`${post.id}-${index}`} post={post} />
            ))}
          </div>
        ) : variant === 'list' ? (
          // List Layout - Traditional blog style
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostItemList key={`${post.id}-${index}`} post={post} />
            ))}
          </div>
        ) : variant === 'timeline' ? (
          // Timeline Layout - Horizontal timeline style
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostItemTimeline key={`${post.id}-${index}`} post={post} />
            ))}
          </div>
        ) : (
          // Grid Layout - Modern card style (fallback)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <PostItemCard key={`${post.id}-${index}`} post={post} />
            ))}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default PostList;
