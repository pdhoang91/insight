// components/Shared/PersonalBlogSidebar.js - Clean Medium 2024 Design
import React from 'react';
import Link from 'next/link';
import { useCategories } from '../../hooks/useCategories';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import PopularPosts from '../Post/PopularPosts';
import Archive from '../Archive/Archive';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const PersonalBlogSidebar = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(5);

  return (
    <div className="space-y-6">
      {/* Popular Posts */}
      <div className="bg-medium-bg-card rounded-lg p-4">
        <h3 className="text-lg font-semibold text-medium-text-primary mb-3">
          Popular Posts
        </h3>
        <PopularPosts 
          limit={5} 
          showImages={false} 
          className=""
        />
      </div>

      {/* Categories */}
      <div className="bg-medium-bg-card rounded-lg p-4">
        <h3 className="text-lg font-semibold text-medium-text-primary mb-3">
          Categories
        </h3>
        
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="h-8 w-16 bg-medium-bg-secondary rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories?.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.name}`}
                className="px-3 py-1 bg-medium-bg-secondary text-medium-text-secondary hover:bg-medium-accent-green hover:text-white rounded-full text-sm transition-colors"
              >
                {category.name}
                {category.post_count && (
                  <span className="ml-1 opacity-75">
                    ({category.post_count})
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Archive */}
      <div className="bg-medium-bg-card rounded-lg p-4">
        <h3 className="text-lg font-semibold text-medium-text-primary mb-3">
          Archive
        </h3>
        <Archive 
          posts={recentPosts} 
          className=""
        />
      </div>
    </div>
  );
};

export default PersonalBlogSidebar;