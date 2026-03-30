'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useHomeData } from '../../hooks/useHomeData';
import { useArchiveSummary } from '../../hooks/useArchiveSummary';
import { fetchPopularTags } from '../../app/lib/api';
import Archive from '../Archive/Archive';
import TagCloud from '../Shared/TagCloud';

const isLocalImage = (src) => src?.includes('localhost');

/* ─── Page hero — same rhythm as HomeHero ─── */
const ExploreHero = () => {
  const t = useTranslations();
  return (
    <div className="animate-fade-up delay-0 pb-12 mb-12 border-b border-[var(--border)]">
      <p className="ui-section-header mb-3" style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}>
        Discover
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
          lineHeight: 1.08,
          letterSpacing: '-0.035em',
          color: 'var(--text)',
          margin: '0 0 0.75rem 0',
        }}
      >
        Explore
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.05rem',
          lineHeight: 1.65,
          color: 'var(--text-muted)',
          maxWidth: '42ch',
          margin: 0,
        }}
      >
        {t('category.heroDescription')}
      </p>
    </div>
  );
};

/* ─── Generic section wrapper ─── */
const Section = ({ title, children, className = '' }) => (
  <div className={`pb-10 mb-10 border-b border-[var(--border)] last:border-0 last:pb-0 last:mb-0 ${className}`}>
    <p className="ui-section-header mb-5">{title}</p>
    {children}
  </div>
);

/* ─── Popular posts with thumbnail — same as PersonalBlogSidebar ─── */
const PopularPostsList = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-3 py-2">
            <div className="flex-shrink-0 w-[64px] h-[64px] bg-[var(--bg-surface)] rounded skeleton-warm" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="skeleton-warm h-3 rounded w-full" />
              <div className="skeleton-warm h-3 rounded w-4/5" />
              <div className="skeleton-warm h-3 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {posts.slice(0, 8).map((post) => (
        <article key={post.id}>
          <Link href={`/p/${post.slug}`} className="flex gap-3 py-3 group">
            <div className="flex-shrink-0 w-[64px] h-[64px] overflow-hidden bg-[var(--bg-surface)] relative">
              {post.cover_image ? (
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="64px"
                  style={{ objectFit: 'cover' }}
                  unoptimized={isLocalImage(post.cover_image)}
                />
              ) : (
                <div className="w-full h-full bg-[var(--bg-surface)] flex items-center justify-center">
                  <span className="text-[var(--text-faint)] text-xs font-bold uppercase tracking-wider">
                    {post.title?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h3 className="flex-1 text-[13px] font-medium leading-snug text-[var(--accent)] group-hover:underline line-clamp-3 pt-0.5">
              {post.title}
            </h3>
          </Link>
        </article>
      ))}
    </div>
  );
};

/* ─── Main ─── */
const ExplorePanelContent = () => {
  const t = useTranslations();
  const { categories, popularPosts, isLoading } = useHomeData();
  const { archiveList } = useArchiveSummary();
  const { data: popularTags, isLoading: tagsLoading } = useSWR(
    '/tags/popular',
    () => fetchPopularTags(20),
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return (
    <div>
      <ExploreHero />

      {/* Popular Posts + Categories — 2-col on desktop */}
      <div className="animate-fade-up delay-100 grid grid-cols-1 lg:grid-cols-2 gap-x-12 pb-10 mb-10 border-b border-[var(--border)]">
        <div>
          <p className="ui-section-header mb-5">{t('sidebar.popularPosts')}</p>
          <PopularPostsList posts={popularPosts} isLoading={isLoading} />
        </div>

        <div className="mt-10 lg:mt-0">
          <p className="ui-section-header mb-5">{t('sidebar.categories')}</p>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-warm"
                  style={{ height: '1.75rem', width: `${60 + (i % 3) * 20}px`, borderRadius: '9999px' }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 12).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.name.toLowerCase()}`} className="taxonomy-pill">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <Section title={t('sidebar.tags')} className="animate-fade-up delay-200">
        <TagCloud tags={popularTags} isLoading={tagsLoading} limit={40} />
      </Section>

      {/* Archive */}
      <Section title={t('sidebar.archive')} className="animate-fade-up delay-300">
        <Archive archiveList={archiveList} />
      </Section>
    </div>
  );
};

export default ExplorePanelContent;
