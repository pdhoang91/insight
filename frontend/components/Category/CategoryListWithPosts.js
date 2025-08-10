// components/Category/CategoryListWithPosts.js
import React from 'react';
import PostItem from '../Post/PostItem';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';

const CategoryListWithPosts = ({ posts, isLoading, isError, setSize, isReachingEnd }) => {
  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize(prevSize => prevSize + 1);
    }
  };

  const renderItem = (post) => {
    if (!post || !post.id) {
      console.warn('Post without id:', post);
      return null;
    }
    return (
      <div key={post.id} className="border-b border-border-primary/50 pb-6 last:border-b-0 last:pb-0">
        <PostItem post={post} variant="default" />
      </div>
    );
  };

  if (isError) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">Failed to Load Posts</h3>
        <p className="text-secondary font-mono text-sm">
          Unable to load posts for this category. Please try again later.
        </p>
      </div>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-muted/20 rounded-full"></div>
              <div className="h-4 bg-muted/20 rounded w-32"></div>
              <div className="h-4 bg-muted/20 rounded w-24"></div>
            </div>
            <div className="h-6 bg-muted/20 rounded w-3/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/20 rounded w-full"></div>
              <div className="h-4 bg-muted/20 rounded w-2/3"></div>
            </div>
            <div className="border-b border-border-primary/50 mt-6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 md:py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">No Posts Found</h3>
        <p className="text-secondary font-mono text-sm">
          No articles available in this category yet. Check back later for new content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary font-mono">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      <InfiniteScrollWrapper
        items={posts}
        renderItem={renderItem}
        fetchMore={fetchMore}
        hasMore={!isReachingEnd}
        loader={
          <div className="text-center py-6">
            <div className="inline-flex items-center space-x-2 text-secondary font-mono text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Loading more posts...</span>
            </div>
          </div>
        }
        endMessage={
          <p className="text-center text-muted font-mono py-6 text-sm">
            // End of posts in this category
          </p>
        }
        className="space-y-6"
      />
    </div>
  );
};

export default CategoryListWithPosts;
