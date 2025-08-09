// components/Category/CategoryItem.js
import React from 'react';
import Link from 'next/link';
import PostItem from '../Post/PostItem'; // Đảm bảo bạn đã tạo component này
import { usePostsByCategory } from '../../hooks/usePostsByCategory';

const CategoryItem = ({ category }) => {
  const { posts, isLoading, isError } = usePostsByCategory(category.name, 2);

  return (
    <div className="post-item">
      {/* Category Header */}
      <header className="mb-4">
        <h2 className="text-2xl font-bold mb-2">
          <Link href={`/category/${encodeURIComponent(category.name)}`} className="text-gray-900 hover:text-blue-600 transition-colors">
            {category.name}
          </Link>
        </h2>
        <p className="text-gray-600">{category.description}</p>
      </header>

      {/* Posts Section */}
      <div className="mt-4">
        {isError && <p className="text-red-600 font-mono">// Failed to load posts</p>}
        {isLoading ? (
          <p className="text-gray-600 font-mono">Loading posts...</p>
        ) : (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map(post => <PostItem key={post.id} post={post} variant="compact" />)
            ) : (
              <p className="text-gray-500 font-mono">// No posts available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryItem;

