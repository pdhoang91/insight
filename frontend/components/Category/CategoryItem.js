// components/Category/CategoryItem.js
import React from 'react';
import Link from 'next/link';
import PostItemCategories from '../Post/PostItemCategories';
import { usePostsByCategory } from '../../hooks/usePostsByCategory';
import { FaFolder, FaSpinner } from 'react-icons/fa';

const CategoryItem = ({ category }) => {
  const { posts, isLoading, isError } = usePostsByCategory(category.name, 2);

  return (
    <div className="bg-surface rounded-lg p-6 border border-border-primary/30 shadow-sm">
      {/* Category Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <FaFolder className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary">
            <Link 
              href={`/category/${encodeURIComponent(category.name)}`} 
              className="hover:text-primary-hover transition-colors"
            >
              {category.name}
            </Link>
          </h2>
        </div>
        {category.description && (
          <p className="text-secondary font-mono text-sm">// {category.description}</p>
        )}
      </header>

      {/* Posts Section */}
      <div className="mt-6">
        {isError && (
          <div className="p-4 border border-danger/20 rounded-lg bg-danger/5">
            <p className="text-danger font-mono text-sm">// Failed to load posts</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center gap-2 p-4">
            <FaSpinner className="animate-spin text-primary w-4 h-4" />
            <span className="text-secondary font-mono text-sm">Loading posts...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostItemCategories key={post.id} post={post} />
              ))
            ) : (
              <div className="p-4 border border-border-primary rounded-lg bg-elevated/50">
                <p className="text-muted font-mono text-sm text-center">// No posts available in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryItem;

