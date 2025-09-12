// components/Shared/PersonalBlogSidebar.js - Clean Medium 2024 Design
import React from 'react';
import Link from 'next/link';
import { useCategories } from '../../hooks/useCategories';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import PopularPosts from '../Post/PopularPosts';
import Archive from '../Archive/Archive';

const PersonalBlogSidebar = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(50);

  return (
    <div className="space-y-8">
      {/* Sticky container for better UX */}
      <div className="sticky top-24 space-y-8">
        
        {/* Popular Posts */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-heading-3 text-medium-text-primary">
            Trending
          </h3>
          <PopularPosts limit={5} showImages={false} />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-heading-3 text-medium-text-primary">
            Topics
          </h3>
          
          {categoriesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8  animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories?.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.name}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-body-small  text-medium-text-secondary hover:bg-medium-accent-green hover:text-white transition-all duration-200"
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-75">
                    {category.post_count || 0}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Archive */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-heading-3 text-medium-text-primary">
            Archive
          </h3>
          <Archive posts={recentPosts} isLoading={postsLoading} />
        </div>

      </div>
    </div>
  );
};

export default PersonalBlogSidebar;