// components/Sidebar/PersonalBlogSidebar.js
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCategories } from '../../hooks/useCategories';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import PopularPosts from '../Post/PopularPosts';
import Archive from '../Archive/Archive';

const SidebarSection = ({ title, children }) => (
  <div className="pb-6 mb-6 border-b border-[#f2f2f2] last:border-0 last:pb-0 last:mb-0">
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#757575] mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const PersonalBlogSidebar = () => {
  const t = useTranslations();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(5);

  return (
    <div>
      <SidebarSection title={t('sidebar.popularPosts')}>
        <PopularPosts limit={5} showImages={false} />
      </SidebarSection>

      <SidebarSection title={t('sidebar.categories')}>
        {categoriesLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-20 bg-[#f2f2f2] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {categories?.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.name}`}
                className="block text-[13px] text-[#757575] hover:text-[#292929] transition-colors"
              >
                {category.name}
                {category.post_count > 0 && (
                  <span className="ml-1.5 text-[#b3b3b1]">({category.post_count})</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title={t('sidebar.archive')}>
        <Archive posts={recentPosts} />
      </SidebarSection>
    </div>
  );
};

export default PersonalBlogSidebar;
