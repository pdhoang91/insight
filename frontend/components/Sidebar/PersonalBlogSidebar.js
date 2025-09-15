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
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(50);

  return (
    <div className={themeClasses.spacing.stackLarge}>
      {/* Sticky container for better UX */}
      <div className={combineClasses(
        'sticky top-24',
        themeClasses.spacing.stackLarge
      )}>
        
        {/* Popular Posts */}
        <div className={themeClasses.spacing.stack}>
          <h3 className={combineClasses(
            themeClasses.typography.h3,
            themeClasses.text.primary,
            'mb-4'
          )}>
            Popular
          </h3>
          <PopularPosts 
            limit={5} 
            showImages={false} 
            className="!border-0 !shadow-none !bg-transparent !p-0" 
          />
        </div>

        {/* Categories */}
        <div className={themeClasses.spacing.stack}>
          <h3 className={combineClasses(
            themeClasses.typography.h3,
            themeClasses.text.primary,
            'mb-4'
          )}>
            Categories
          </h3>
          
          {categoriesLoading ? (
            <div className={themeClasses.spacing.stackSmall}>
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={combineClasses(
                    'h-6 rounded',
                    themeClasses.patterns.skeleton
                  )}
                ></div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {categories?.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.name}`}
                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-medium-accent-green/5 transition-colors group"
                >
                  <span className="text-sm lg:text-base text-medium-text-secondary group-hover:text-medium-accent-green">
                    {category.name}
                  </span>
                  {category.post_count && (
                    <span className="text-xs text-medium-text-muted">
                      {category.post_count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Archive */}
        <div className={themeClasses.spacing.stack}>
          <h3 className={combineClasses(
            themeClasses.typography.h3,
            themeClasses.text.primary,
            'mb-4'
          )}>
            Archive
          </h3>
          <Archive 
            posts={recentPosts} 
            className="!border-0 !shadow-none !bg-transparent !p-0" 
          />
        </div>

      </div>
    </div>
  );
};

export default PersonalBlogSidebar;