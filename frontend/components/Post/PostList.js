// components/Post/PostList.js - Medium 2024 Design
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostItem from '../Post/PostItem';
import { componentClasses } from '../../utils/themeClasses';

const PostList = ({ 
  posts, 
  isLoading, 
  isError, 
  setSize, 
  isReachingEnd,
  variant = 'default',
  showImages = true,
  showExcerpts = true,
  className = ''
}) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize((prevSize) => prevSize + 1);
    }
  };

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-medium-text-muted mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-medium-text-primary mb-2">
          Đã xảy ra lỗi
        </h3>
        <p className="text-medium-text-secondary mb-4">
          Không thể tải bài viết. Vui lòng thử lại.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className={componentClasses.button.primary}
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Loading state for initial load
  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <div className={`space-y-8 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-medium-bg-card rounded-xl p-6 animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1 space-y-4">
                {/* Title skeleton */}
                <div className="h-8 bg-medium-bg-secondary rounded-lg w-3/4"></div>
                {/* Content skeleton */}
                <div className="space-y-3">
                  <div className="h-4 bg-medium-bg-secondary rounded w-full"></div>
                  <div className="h-4 bg-medium-bg-secondary rounded w-5/6"></div>
                  <div className="h-4 bg-medium-bg-secondary rounded w-4/5"></div>
                </div>
                {/* Meta info skeleton */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-medium-bg-secondary rounded w-20"></div>
                    <div className="w-1 h-1 bg-medium-bg-secondary rounded-full"></div>
                    <div className="h-4 bg-medium-bg-secondary rounded w-16"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-8 bg-medium-bg-secondary rounded-full w-16"></div>
                    <div className="h-8 bg-medium-bg-secondary rounded-full w-16"></div>
                    <div className="h-8 bg-medium-bg-secondary rounded-full w-12"></div>
                  </div>
                </div>
              </div>
              {/* Image skeleton */}
              <div className="w-full lg:w-80">
                <div className="aspect-[16/10] bg-medium-bg-secondary rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-medium-text-muted mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-xl font-serif font-medium text-medium-text-primary mb-2">
          No stories yet
        </h3>
        <p className="text-medium-text-secondary">
          Be the first to share your thoughts and experiences.
        </p>
      </div>
    );
  }

  // Flatten posts array (handle nested arrays from SWR)
  const flatPosts = posts.flat().filter(Boolean);

  return (
    <div className={className}>
      <InfiniteScroll
        dataLength={flatPosts.length}
        next={fetchMore}
        hasMore={!isReachingEnd}
        loader={
          <div className="space-y-8 mt-8">
            {[...Array(2)].map((_, index) => (
              <div key={`loading-${index}`} className="bg-medium-bg-card rounded-xl p-6 animate-pulse">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Title skeleton */}
                    <div className="h-8 bg-medium-bg-secondary rounded-lg w-3/4"></div>
                    {/* Content skeleton */}
                    <div className="space-y-3">
                      <div className="h-4 bg-medium-bg-secondary rounded w-full"></div>
                      <div className="h-4 bg-medium-bg-secondary rounded w-5/6"></div>
                      <div className="h-4 bg-medium-bg-secondary rounded w-4/5"></div>
                    </div>
                    {/* Meta info skeleton */}
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-4 bg-medium-bg-secondary rounded w-20"></div>
                        <div className="w-1 h-1 bg-medium-bg-secondary rounded-full"></div>
                        <div className="h-4 bg-medium-bg-secondary rounded w-16"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="h-8 bg-medium-bg-secondary rounded-full w-16"></div>
                        <div className="h-8 bg-medium-bg-secondary rounded-full w-16"></div>
                        <div className="h-8 bg-medium-bg-secondary rounded-full w-12"></div>
                      </div>
                    </div>
                  </div>
                  {/* Image skeleton */}
                  <div className="w-full lg:w-80">
                    <div className="aspect-[16/10] bg-medium-bg-secondary rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
        endMessage={
          flatPosts.length > 0 && (
            <div className="text-center py-8 border-t border-medium-divider mt-8">
              <p className="text-medium-text-muted">
                You've reached the end!
              </p>
            </div>
          )
        }
        refreshFunction={() => window.location.reload()}
        pullDownToRefresh={false}
        className="space-y-6 lg:space-y-8"
      >
        {flatPosts.map((post, index) => (
          <div key={`${post.id}-${index}`} className="mb-6 lg:mb-8">
            <PostItem
              post={post}
              variant={variant}
              showImage={showImages}
              showExcerpt={showExcerpts}
            />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default PostList;
