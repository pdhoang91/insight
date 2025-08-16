// components/Category/CategoryListWithPosts.js
import React from 'react';
import PostItemCategories from '../Post/PostItemCategories';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
import { FaExclamationTriangle, FaFileAlt, FaSpinner } from 'react-icons/fa';

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
      <div key={post.id} className="border-b border-border-primary/30 pb-6 last:border-b-0 last:pb-0">
        <PostItemCategories post={post} />
      </div>
    );
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-3 p-6 border border-danger/20 rounded-lg bg-danger/5">
          <FaExclamationTriangle className="w-6 h-6 text-danger" />
          <div>
            <h3 className="font-mono text-danger font-semibold">// Không thể tải bài viết</h3>
            <p className="text-muted text-sm mt-1">Không thể tải bài viết cho danh mục này. Vui lòng thử lại sau.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="p-6">
              {/* Header skeleton */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-elevated rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-elevated rounded w-24"></div>
                  <div className="w-1 h-1 bg-elevated rounded-full"></div>
                  <div className="h-4 bg-elevated rounded w-16"></div>
                  <div className="w-1 h-1 bg-elevated rounded-full"></div>
                  <div className="h-4 bg-elevated rounded w-20"></div>
                </div>
              </div>
              
              <div className="flex gap-6">
                {/* Content skeleton */}
                <div className="flex-1">
                  <div className="h-7 bg-elevated rounded w-4/5 mb-3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-elevated rounded w-full"></div>
                    <div className="h-4 bg-elevated rounded w-3/4"></div>
                    <div className="h-4 bg-elevated rounded w-2/3"></div>
                  </div>
                  {/* Categories skeleton */}
                  <div className="flex gap-2 mb-4">
                    <div className="h-7 bg-elevated rounded-full w-20"></div>
                    <div className="h-7 bg-elevated rounded-full w-24"></div>
                  </div>
                </div>
                
                {/* Image skeleton */}
                <div className="w-32 md:w-40 lg:w-48 flex-shrink-0">
                  <div className="w-full h-24 md:h-32 lg:h-36 bg-elevated rounded-lg"></div>
                </div>
              </div>
              
              {/* Action bar skeleton */}
              <div className="flex items-center justify-between pt-4 border-t border-border-primary/20">
                <div className="flex items-center gap-6">
                  <div className="h-4 bg-elevated rounded w-12"></div>
                  <div className="h-4 bg-elevated rounded w-12"></div>
                  <div className="h-4 bg-elevated rounded w-12"></div>
                </div>
                <div className="h-4 bg-elevated rounded w-20"></div>
              </div>
            </div>
            <div className="border-b border-border-primary/30 mt-6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-3 p-6 border border-border-primary rounded-lg bg-elevated/50">
          <FaFileAlt className="w-6 h-6 text-muted" />
          <div>
            <h3 className="font-mono text-primary font-semibold">// Không tìm thấy bài viết</h3>
            <p className="text-muted text-sm mt-1">Chưa có bài viết nào trong danh mục này. Hãy quay lại sau để xem nội dung mới.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="flex items-center justify-between border-b border-border-primary/30 pb-3">
        <p className="text-sm text-secondary font-mono">
          // Tìm thấy {posts.length} bài viết
        </p>
      </div>

      <InfiniteScrollWrapper
        items={posts}
        renderItem={renderItem}
        fetchMore={fetchMore}
        hasMore={!isReachingEnd}
        loader={
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3 p-4 border border-border-primary rounded-lg bg-elevated">
              <FaSpinner className="animate-spin text-primary w-5 h-5" />
              <span className="text-secondary font-mono">Đang tải thêm bài viết...</span>
            </div>
          </div>
        }
        endMessage={
          <div className="text-center py-8">
            <p className="text-muted font-mono text-sm">// Hết bài viết trong danh mục này</p>
          </div>
        }
        className="space-y-6"
      />
    </div>
  );
};

export default CategoryListWithPosts;
