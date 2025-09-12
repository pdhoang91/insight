// components/Category/CategoryPosts.js
import React from 'react';
import PostList from '../Post/PostList';
const CategoryPosts = ({ 
  categoryName, 
  posts, 
  isLoading, 
  isError, 
  setSize, 
  isReachingEnd 
}) => {

  if (isError) {
    return (
      <div className="text-center py-12 text-medium-text-secondary">
        <h3 className="text-lg font-medium mb-2">Có lỗi xảy ra</h3>
        <p>Không thể tải bài viết cho danh mục này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Category Header */}
      <header className="text-center lg:text-left">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-medium-text-primary mb-3 lg:mb-4">
          {categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1)}
        </h1>
        <p className="text-base sm:text-lg text-medium-text-secondary max-w-2xl mx-auto lg:mx-0">
          Khám phá các bài viết trong danh mục này
        </p>
      </header>

      {/* Posts List */}
      <PostList
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
        variant="category"
        showImages={true}
        showExcerpts={true}
      />
    </div>
  );
};

export default CategoryPosts;
