// components/Category/CategoryItem.js
import React from 'react';
import Link from 'next/link';
import PostItem from '../Post/PostItem'; // Đảm bảo bạn đã tạo component này
import { usePostsByCategory } from '../../hooks/usePostsByCategory';

const CategoryItem = ({ category }) => {
  const { posts, isLoading, isError } = usePostsByCategory(category.name, 2);

  return (
    <div className=" rounded p-4 transition-shadow mb-6">
      <h2 className="center-parent text-xl font-semibold mb-2">
        <Link href={`/category/${encodeURIComponent(category.name)}`} className="text-blue-500 hover:underline">
          {category.name}
        </Link>
      </h2>
      <p className="text-gray-600 mb-4">{category.description}</p>

      {isError && <p className="text-red-500">Failed to load posts for this category.</p>}
      {isLoading ? (
        <p>Loading posts...</p>
      ) : (
        <div>
          {posts.length > 0 ? (
            posts.map(post => <PostItem key={post.id} post={post} />)
          ) : (
            <p className="text-gray-600">No posts available for this category.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;

