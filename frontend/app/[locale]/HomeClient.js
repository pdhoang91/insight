'use client';

import React from 'react';
import { useInfinitePosts } from '../../hooks/useInfinitePosts';
import { useHomeData } from '../../hooks/useHomeData';
import { HomeLayout } from '../../components/Layout/Layout';
import PostList from '../../components/Post/PostList';
import DiscoveryBreak from '../../components/Post/DiscoveryBreak';
import PersonalBlogSidebar from '../../components/Sidebar/PersonalBlogSidebar';
import StickyCategoryBar from '../../components/Sidebar/StickyCategoryBar';
import { useTranslations } from 'next-intl';

/* ─── Asymmetric hero header ─────────────────────────────────────
   Left: blog identity (name + tagline)
   Right: a single decorative large label (muted, offset)
   No cards. Just confident white space.
   ────────────────────────────────────────────────────────────── */
const HomeHero = () => {
  const t = useTranslations();
  return (
    <div className="animate-fade-up delay-0 grid pb-12 mb-12"
      style={{ gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '2rem' }}
    >
      {/* Left: identity */}
      <div>
        <p className="ui-section-header mb-3" style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}>
          {t('home.personalWriting')}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.08, letterSpacing: '-0.035em', color: 'var(--text)', margin: '0 0 1rem 0' }}>
          Insight
        </h1>
        <p className="author-bio" style={{ fontSize: '1.05rem', lineHeight: 1.65, maxWidth: '42ch' }}>
          {t('home.tagline')}
        </p>
      </div>

      {/* Right: decorative year */}
      <div
        aria-hidden="true"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--accent)', opacity: 0.15, userSelect: 'none', paddingBottom: '0.1em' }}
      >
        {new Date().getFullYear()}
      </div>
    </div>
  );
};

/* ─── Section label ─── */
const SectionLabel = ({ children }) => (
  <p className="ui-section-header mb-[1.75rem]" style={{ fontSize: '0.68rem', letterSpacing: '0.1em' }}>
    {children}
  </p>
);

export default function HomeClient({ initialHomeData }) {
  const t = useTranslations();
  const { posts, isLoading, isError, setSize, isReachingEnd } = useInfinitePosts(
    initialHomeData
      ? [{ posts: initialHomeData.latest_posts, totalCount: initialHomeData.total_posts }]
      : undefined
  );

  const { categories, popularPosts } = useHomeData(initialHomeData);

  return (
    <HomeLayout
      sidebar={<PersonalBlogSidebar initialHomeData={initialHomeData} />}
      hideMobileSidebar
    >
      <HomeHero />

      {/* Mobile: sticky category bar — appears below hero, sticks under navbar */}
      <StickyCategoryBar categories={categories} />

      <div className="animate-fade-up delay-200">
        <SectionLabel>{t('home.latestWriting')}</SectionLabel>
        <PostList
          posts={posts}
          isLoading={isLoading}
          isError={isError}
          setSize={setSize}
          isReachingEnd={isReachingEnd}
          interstitial={{
            afterIndex: 4,
            element: <DiscoveryBreak posts={popularPosts} />,
          }}
        />
      </div>

    </HomeLayout>
  );
}
