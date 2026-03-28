'use client';
// components/Sidebar/PersonalBlogSidebar.js — Warm Dispatch
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useHomeData } from '../../hooks/useHomeData';
import { useArchiveSummary } from '../../hooks/useArchiveSummary';
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

/* ─── Author bio card ─── */
const AuthorBio = () => (
  <div style={{ marginBottom: '2rem' }}>
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
      Writing about software — how it's built, how it breaks, and what it teaches.
    </p>
  </div>
);

const PersonalBlogSidebar = ({ initialHomeData }) => {
  const t = useTranslations();
  const { categories, popularPosts, isLoading: homeLoading } = useHomeData(initialHomeData);
  const { archiveList } = useArchiveSummary();

  const categoriesLoading = homeLoading && !initialHomeData;
  const postsLoading = homeLoading && !initialHomeData;

  return (
    <div>
      <AuthorBio />

      <SidebarSection title={t('sidebar.popularPosts')}>
        {postsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-3/4 bg-[var(--bg-surface)] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[var(--bg-surface)] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {popularPosts.slice(0, 5).map((post) => (
              <article key={post.id} className="py-2">
                <Link href={`/p/${post.slug}`} className="block group">
                  <h4 className="text-[13px] font-medium text-[var(--text)] group-hover:underline line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                </Link>
              </article>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title={t('sidebar.categories')}>
        {categoriesLoading ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton-warm"
                style={{ height: '1.75rem', width: `${60 + (i % 3) * 20}px`, borderRadius: '9999px' }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories?.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.name.toLowerCase()}`}
                style={{
                  display: 'inline-block',
                  padding: '0.3rem 0.85rem',
                  border: '1px solid var(--border)',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  background: 'var(--bg)',
                  transition: 'border-color 0.2s, color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title={t('sidebar.archive')}>
        <Archive archiveList={archiveList} />
      </SidebarSection>
    </div>
  );
};

export default PersonalBlogSidebar;
