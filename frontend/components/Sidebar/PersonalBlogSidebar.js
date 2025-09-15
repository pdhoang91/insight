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
    <div className="space-y-10">
      {/* Sticky container for better UX */}
      <div className="sticky top-24 space-y-10">
        
        {/* Popular Posts */}
        <div className="space-y-5">
          <h3 className="font-serif font-medium text-lg text-medium-text-primary">
            Popular
          </h3>
          <PopularPosts limit={5} showImages={false} className="!border-0 !shadow-none !bg-transparent !p-0" />
        </div>

        {/* Categories */}
        <div className="space-y-5">
          <h3 className="font-serif font-medium text-lg text-medium-text-primary">
            Categories
          </h3>
          
          {categoriesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-medium-text-muted/10 animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories?.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.name}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-accent-green/10 transition-all duration-200"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Archive */}
        <div className="space-y-5">
          <h3 className="font-serif font-medium text-lg text-medium-text-primary">
            Archive
          </h3>
          <Archive posts={recentPosts} className="!border-0 !shadow-none !bg-transparent !p-0" />
        </div>

      </div>
    </div>
  );
};

export default PersonalBlogSidebar;