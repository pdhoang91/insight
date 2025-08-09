// components/Post/PostList.js
import React from 'react';
import PostItem from './PostItem';
import EnhancedPostItem from './EnhancedPostItem';
import CompactPostItem from './CompactPostItem';
import LoadingSpinner from '../Shared/LoadingSpinner';
import InfiniteScroll from 'react-infinite-scroll-component';

// Enhanced Skeleton component for different variants
const PostSkeleton = ({ variant = 'card' }) => {
  if (variant === 'enhanced') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        {/* Image skeleton */}
        <div className="h-56 bg-gray-200"></div>
        <div className="p-6">
          {/* Author info skeleton */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          
          {/* Content skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          
          {/* Tags skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-14"></div>
          </div>
          
          {/* Actions skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="flex">
          <div className="w-20 h-20 bg-gray-200"></div>
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="flex gap-1 mb-2">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <div className="h-3 bg-gray-200 rounded w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Default card skeleton
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

const PostList = ({ posts, isLoading, isError, setSize, isReachingEnd, variant = 'enhanced', compact = false }) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize((prevSize) => prevSize + 1);
    }
  };

  // Error State
  if (isError) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Failed to load posts</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Something went wrong while fetching the posts. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
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
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No posts found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No posts have been published yet. Be the first to share your knowledge with the community!
        </p>
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
          variant === 'enhanced' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="enhanced" />
              ))}
            </div>
          ) : variant === 'list' ? (
            <div className="space-y-6 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="list" />
              ))}
            </div>
          ) : variant === 'compact' ? (
            <div className="space-y-4 mt-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} variant="compact" />
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">
              🎉 You've reached the end! No more posts to load.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later for new content from our amazing community.
            </p>
          </div>
        }
      >
        {/* Posts Layout */}
        {variant === 'enhanced' ? (
          // Enhanced Layout - Rich cards with more content
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <EnhancedPostItem key={`${post.id}-${index}`} post={post} variant="enhanced" />
            ))}
          </div>
        ) : variant === 'compact' ? (
          // Compact Layout - For sidebar or dense listings
          <div className="space-y-4">
            {posts.map((post, index) => (
              <CompactPostItem key={`${post.id}-${index}`} post={post} />
            ))}
          </div>
        ) : variant === 'list' ? (
          // List Layout - Traditional blog style
          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostItem key={`${post.id}-${index}`} post={post} variant="list" />
            ))}
          </div>
        ) : (
          // Grid Layout - Modern card style (fallback)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <PostItem key={`${post.id}-${index}`} post={post} variant="card" />
            ))}
          </div>
        )}
      </InfiniteScroll>

      {/* Posts count info */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-4">
        <div className="flex items-center justify-center space-x-4">
          <span>
            Showing <strong>{posts.length}</strong> {posts.length === 1 ? 'story' : 'stories'}
          </span>
          {posts.length > 0 && (
            <>
              <span>•</span>
              <span>
                by <strong>{new Set(posts.map(p => p.user?.name).filter(Boolean)).size}</strong> authors
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostList;
