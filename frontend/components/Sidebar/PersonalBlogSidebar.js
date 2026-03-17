// components/Sidebar/PersonalBlogSidebar.js — Warm Dispatch
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCategories } from '../../hooks/useCategories';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import PopularPosts from '../Post/PopularPosts';
import Archive from '../Archive/Archive';

/* ─── Section header ─── */
const SidebarSection = ({ title, children }) => (
  <div
    style={{
      paddingBottom: '1.75rem',
      marginBottom: '1.75rem',
      borderBottom: '1px solid var(--border)',
    }}
    className="last:border-0 last:pb-0 last:mb-0"
  >
    <p
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.66rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: '1.1rem',
        margin: '0 0 1.1rem 0',
      }}
    >
      {title}
    </p>
    {children}
  </div>
);

const PersonalBlogSidebar = () => {
  const t = useTranslations();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(5);

  return (
    <div>
      {/* Popular Posts */}
      <SidebarSection title={t('sidebar.popularPosts')}>
        <PopularPosts limit={5} showImages={false} />
      </SidebarSection>

      {/* Categories */}
      <SidebarSection title={t('sidebar.categories')}>
        {categoriesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton-warm"
                style={{ height: '0.875rem', width: `${55 + (i % 3) * 20}%`, borderRadius: '2px' }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories?.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--text-muted)',
                  padding: '0.3rem 0',
                  transition: 'color 0.2s',
                  borderBottom: '1px solid transparent',
                }}
                className="hover:text-[var(--text)]"
              >
                <span>{category.name}</span>
                {category.post_count > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.7rem',
                      color: 'var(--text-faint)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {category.post_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      {/* Archive */}
      <SidebarSection title={t('sidebar.archive')}>
        <Archive posts={recentPosts} />
      </SidebarSection>
    </div>
  );
};

export default PersonalBlogSidebar;
