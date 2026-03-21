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

/* ─── Author bio card ─── */
const AuthorBio = () => (
  <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.75rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--bg-surface)', flexShrink: 0,
        border: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>
          Insight
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--text-faint)', letterSpacing: '0.01em' }}>
          Software
        </div>
      </div>
    </div>
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
      Writing about software — how it's built, how it breaks, and what it teaches.
    </p>
  </div>
);

const PersonalBlogSidebar = ({ initialHomeData }) => {
  const t = useTranslations();
  const { categories, popularPosts, latestPosts, isLoading: homeLoading } = useHomeData(initialHomeData);

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
              <article key={post.id} className="py-2 border-b border-[var(--border)] last:border-0">
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
