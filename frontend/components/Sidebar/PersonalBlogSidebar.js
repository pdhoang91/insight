// components/Sidebar/PersonalBlogSidebar.js
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useCategories } from '../../hooks/useCategories';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import PopularPosts from '../Post/PopularPosts';
import Archive from '../Archive/Archive';

const SidebarSection = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-medium-border p-5 mb-4">
    <h3 className="font-serif font-bold text-base text-medium-text-primary mb-4">{title}</h3>
    {children}
  </div>
);

const PersonalBlogSidebar = () => {
  const { t } = useTranslation('common');
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(5);

  return (
    <div>
      <SidebarSection title={t('sidebar.popularPosts')}>
        <PopularPosts limit={5} showImages={false} className="" />
      </SidebarSection>

      <SidebarSection title={t('sidebar.categories')}>
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 w-16 bg-medium-bg-secondary rounded-full animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories?.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.name}`}
                className="px-3 py-1 bg-medium-bg-secondary text-medium-text-secondary text-sm rounded-full hover:text-medium-accent-green transition-colors"
              >
                {category.name}
                {category.post_count && (
                  <span className="ml-1 opacity-75">({category.post_count})</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title={t('sidebar.archive')}>
        <Archive posts={recentPosts} className="" />
      </SidebarSection>
    </div>
  );
};

export default PersonalBlogSidebar;
