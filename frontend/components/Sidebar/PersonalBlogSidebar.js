// components/Sidebar/PersonalBlogSidebar.js — Warm Dispatch
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useHomeData } from '../../hooks/useHomeData';
import Archive from '../Archive/Archive';

/* ─── Section header ─── */
const SidebarSection = ({ title, children }) => (
  <div
    style={{
      paddingBottom: '1.75rem',
      marginBottom: '1.75rem',
    }}
    className="last:pb-0 last:mb-0"
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

const PersonalBlogSidebar = ({ initialHomeData }) => {
  const t = useTranslations();
  const { categories, popularPosts, latestPosts, isLoading: homeLoading } = useHomeData(initialHomeData);

  const categoriesLoading = homeLoading && !initialHomeData;
  const postsLoading = homeLoading && !initialHomeData;

  return (
    <div>
      <SidebarSection title={t('sidebar.popularPosts')}>
        {postsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-3/4 bg-[#f2f2f2] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#f2f2f2] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {popularPosts.slice(0, 5).map((post) => (
              <article key={post.id} className="py-2 border-b border-[#f2f2f2] last:border-0">
                <a href={`/p/${post.slug}`} className="block group">
                  <h4 className="text-[13px] font-medium text-[#292929] group-hover:underline line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                </a>
              </article>
            ))}
          </div>
        )}
      </SidebarSection>

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
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-faint)', letterSpacing: '0.02em' }}>
                    {category.post_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title={t('sidebar.archive')}>
        <Archive posts={latestPosts} />
      </SidebarSection>
    </div>
  );
};

export default PersonalBlogSidebar;
