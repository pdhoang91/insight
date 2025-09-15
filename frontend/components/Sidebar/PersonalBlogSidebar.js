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
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={combineClasses(
                    'h-8 w-16 rounded-button',
                    themeClasses.patterns.skeleton
                  )}
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories?.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.name}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-button bg-medium-bg-secondary text-sm lg:text-base text-medium-text-secondary hover:bg-medium-accent-green hover:text-white transition-all duration-200"
                >
                  <span>{category.name}</span>
                  {category.post_count && (
                    <span className="text-xs opacity-75">
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