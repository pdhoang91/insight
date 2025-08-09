// components/Post/PostList.js
import React from 'react';
import PostItem from './PostItem';
import LoadingSpinner from '../Shared/LoadingSpinner';
import InfiniteScroll from 'react-infinite-scroll-component';

// Skeleton component for loading states
const PostSkeleton = ({ variant = 'card' }) => {
  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="w-32 h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

const PostList = ({ posts, isLoading, isError, setSize, isReachingEnd, variant = 'card' }) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize((prevSize) => prevSize + 1);
    }
  };

  // Error State
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load posts</h3>
        <p className="text-gray-600 mb-4">Something went wrong while fetching the posts.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Initial Loading State
  if (isLoading && (!posts || posts.length === 0)) {
    const skeletonCount = variant === 'list' ? 5 : 6;
    const gridClass = variant === 'list' 
      ? 'space-y-6' 
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
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600">No posts have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMore}
        hasMore={!isReachingEnd}
        loader={
          variant === 'list' ? (
            <div className="space-y-6 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="card" />
              ))}
            </div>
          )
        }
        endMessage={
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              🎉 You've reached the end! No more posts to load.
            </p>
          </div>
        }
      >
        {/* Posts Layout */}
        {variant === 'list' ? (
          // List Layout - Traditional Blog Style
          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostItem key={`${post.id}-${index}`} post={post} variant="list" />
            ))}
          </div>
        ) : (
          // Grid Layout - Modern Card Style
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <PostItem key={`${post.id}-${index}`} post={post} variant="card" />
            ))}
          </div>
        )}
      </InfiniteScroll>

      {/* Posts count info */}
      <div className="text-center text-sm text-gray-500">
        Showing {posts.length} {posts.length === 1 ? 'story' : 'stories'}
      </div>
    </div>
  );
};

export default PostList;
