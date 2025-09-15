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
        themeClasses.responsive.sidebarDesktopSticky,
        themeClasses.spacing.stackLarge
      )}>
        
        {/* Popular Posts */}
        <div className={themeClasses.spacing.stack}>
          <h3 className={combineClasses(
            themeClasses.typography.h3,
            themeClasses.text.primary,
            themeClasses.utils.sectionSmall
          )}>
            Popular
          </h3>
          <PopularPosts 
            limit={5} 
            showImages={false} 
            className=""
          />
        </div>

        {/* Categories */}
        <div className={themeClasses.spacing.stack}>
          <h3 className={combineClasses(
            themeClasses.typography.h3,
            themeClasses.text.primary,
            themeClasses.utils.sectionSmall
          )}>
            Categories
          </h3>
          
          {categoriesLoading ? (
            <div className={themeClasses.list.horizontal}>
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={combineClasses(
                    'h-8 w-16',
                    themeClasses.effects.rounded,
                    themeClasses.patterns.skeleton,
                    'animate-pulse'
                  )}
                ></div>
              ))}
            </div>
          ) : (
            <div className={themeClasses.list.horizontal}>
              {categories?.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.name}`}
                  className={combineClasses(
                    themeClasses.tag.secondary,
                    'gap-1',
                    themeClasses.typography.bodySmall
                  )}
                >
                  <span>{category.name}</span>
                  {category.post_count && (
                    <span className={combineClasses(
                      themeClasses.typography.captionText,
                      'opacity-75'
                    )}>
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
            themeClasses.utils.sectionSmall
          )}>
            Archive
          </h3>
          <Archive 
            posts={recentPosts} 
            className=""
          />
        </div>

      </div>
    </div>
  );
};

export default PersonalBlogSidebar;