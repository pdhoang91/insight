'use client';

import React from 'react';
import { useInfinitePosts } from '../../hooks/useInfinitePosts';
import { useHomeData } from '../../hooks/useHomeData';
import { HomeLayout } from '../../components/Layout/Layout';
import PostList from '../../components/Post/PostList';
import DiscoveryBreak from '../../components/Post/DiscoveryBreak';
import PersonalBlogSidebar from '../../components/Sidebar/PersonalBlogSidebar';
import StickyCategoryBar from '../../components/Sidebar/StickyCategoryBar';

/* ─── Asymmetric hero header ─────────────────────────────────────
   Left: blog identity (name + tagline)
   Right: a single decorative large label (muted, offset)
   No cards. Just confident white space.
   ────────────────────────────────────────────────────────────── */
const HomeHero = () => (
  <div
    className="animate-fade-up delay-0"
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'end',
      gap: '2rem',
      paddingBottom: '3rem',
      marginBottom: '3rem',
      borderBottom: '1px solid var(--border)',
    }}
  >
    {/* Left: identity */}
    <div>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '0.75rem',
          margin: '0 0 0.75rem 0',
        }}
      >
        Personal writing
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
          lineHeight: 1.08,
          letterSpacing: '-0.035em',
          color: 'var(--text)',
          margin: '0 0 1rem 0',
        }}
      >
        Insight
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
        Notes on software, craft, and the thinking behind what gets built.
      </p>
    </div>

    {/* Right: large decorative year — grid-breaking offset element */}
    <div
      aria-hidden="true"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(3rem, 6vw, 5rem)',
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: 'var(--accent)',
        opacity: 0.15,
        userSelect: 'none',
        paddingBottom: '0.1em',
      }}
    >
      {new Date().getFullYear()}
    </div>
  </div>
);

/* ─── Section label ─── */
const SectionLabel = ({ children }) => (
  <p
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: '0.68rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      marginBottom: '1.75rem',
      margin: '0 0 1.75rem 0',
    }}
  >
    {children}
  </p>
);

export default function HomeClient({ initialHomeData }) {
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
        <SectionLabel>Latest writing</SectionLabel>
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
