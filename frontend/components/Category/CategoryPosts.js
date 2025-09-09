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
    <div className="max-w-container mx-auto px-6 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 font-serif text-medium-text-primary mb-2">
          {categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1)}
        </h1>
        <p className="text-body-large text-medium-text-secondary">
          Khám phá các bài viết trong danh mục này
        </p>
      </div>

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
