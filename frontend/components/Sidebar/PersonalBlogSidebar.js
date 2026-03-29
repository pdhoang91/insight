'use client';
// components/Sidebar/PersonalBlogSidebar.js — Warm Dispatch
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useHomeData } from '../../hooks/useHomeData';
import { useArchiveSummary } from '../../hooks/useArchiveSummary';
import { fetchPopularTags } from '../../app/lib/api';
import Archive from '../Archive/Archive';

const isLocalImage = (src) => src?.includes('localhost');

/* ─── Section header ─── */
const SidebarSection = ({ title, children }) => (
  <div className="pb-[1.75rem] mb-[1.75rem] last:pb-0 last:mb-0">
    <p className="ui-section-header mb-[1.1rem]">{title}</p>
    {children}
  </div>
);

/* ─── Author bio card ─── */
const AuthorBio = () => (
  <div className="mb-8">
    <p className="author-bio">
      Writing about software — how it's built, how it breaks, and what it teaches.
    </p>
  </div>
);

const PersonalBlogSidebar = ({ initialHomeData }) => {
  const t = useTranslations();
  const { categories, popularPosts, isLoading: homeLoading } = useHomeData(initialHomeData);
  const { archiveList } = useArchiveSummary();
  const { data: popularTags, isLoading: tagsLoading } = useSWR(
    '/tags/popular',
    () => fetchPopularTags(20),
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const categoriesLoading = homeLoading && !initialHomeData;
  const postsLoading = homeLoading && !initialHomeData;

  return (
    <div>
      <AuthorBio />

      <SidebarSection title={t('sidebar.popularPosts')}>
        {postsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 py-2">
                <div className="flex-shrink-0 w-[64px] h-[64px] bg-[var(--bg-surface)] rounded animate-pulse" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-[var(--bg-surface)] rounded animate-pulse w-full" />
                  <div className="h-3 bg-[var(--bg-surface)] rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-[var(--bg-surface)] rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {popularPosts.slice(0, 10).map((post) => (
              <article key={post.id}>
                <Link href={`/p/${post.slug}`} className="flex gap-3 py-3 group">
                  {/* Thumbnail */}
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
                  {/* Title */}
                  <h4 className="flex-1 text-[13px] font-medium leading-snug text-[var(--accent)] group-hover:underline line-clamp-3 pt-0.5">
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
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton-warm"
                style={{ height: '1.75rem', width: `${60 + (i % 3) * 20}px`, borderRadius: '9999px' }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories?.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.name.toLowerCase()}`}
                className="taxonomy-pill"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection title={t('sidebar.tags')}>
        {tagsLoading ? (
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="skeleton-warm"
                style={{ height: `${14 + (i % 4) * 4}px`, width: `${45 + (i % 5) * 18}px`, borderRadius: '2px' }}
              />
            ))}
          </div>
        ) : (
          <div className="leading-loose">
            {(popularTags || []).slice(0, 40).map((tag, i) => {
              const total = Math.min((popularTags || []).length, 40);
              const rank = i / total; // 0 = most popular, 1 = least
              // 5 size tiers: largest for top tags, smallest for tail
              const fontSize =
                rank < 0.1 ? '1.6rem' :
                rank < 0.2 ? '1.25rem' :
                rank < 0.4 ? '1rem' :
                rank < 0.65 ? '0.85rem' :
                '0.75rem';
              const fontWeight = rank < 0.2 ? 700 : rank < 0.4 ? 600 : 400;
              return (
                <Link
                  key={tag.id || tag.name}
                  href={`/tag/${tag.name}`}
                  style={{ fontSize, fontWeight, lineHeight: 1.6 }}
                  className="inline-block mr-2 text-[var(--accent)] hover:underline"
                >
                  {tag.name}
                </Link>
              );
            })}
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
