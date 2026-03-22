'use client';
// components/Post/PostList.js — Warm Dispatch with staggered entry
import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import BasePostItem from './BasePostItem';

/* ─── Skeleton ─── */
const PostSkeleton = () => (
  <div style={{ display: 'flex', gap: '1.25rem', paddingBottom: '2rem', marginBottom: '2rem' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div className="skeleton-warm" style={{ height: '1.1rem', width: '75%', borderRadius: '2px' }} />
      <div className="skeleton-warm" style={{ height: '0.85rem', width: '90%', borderRadius: '2px' }} />
      <div className="skeleton-warm" style={{ height: '0.85rem', width: '55%', borderRadius: '2px' }} />
      <div className="skeleton-warm" style={{ height: '0.72rem', width: '4rem', borderRadius: '2px', marginTop: '0.2rem' }} />
    </div>
  </div>
);

const newItemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const PostList = ({
  posts,
  isLoading,
  isError,
  setSize,
  isReachingEnd,
  variant = 'default',
  skipFirst = false,
  className = '',
  interstitial = null,
}) => {
  const t = useTranslations();

  // Track how many items existed before the latest "load more" batch.
  // Items below this index are already rendered — skip animation to avoid
  // 50+ Framer Motion instances accumulating on long feeds.
  const prevCountRef = useRef(0);
  const flatPosts = (() => {
    let fp = (posts || []).flat().filter(Boolean);
    if (skipFirst && fp.length > 0) fp = fp.slice(1);
    return fp;
  })();

  useEffect(() => {
    prevCountRef.current = flatPosts.length;
  });

  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize((prev) => prev + 1);
    }
  };

  /* ─── Error ─── */
  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.5rem' }}>
          {t('post.errorOccurred')}
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {t('post.loadFailed')}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.8rem',
            letterSpacing: '-0.01em', color: 'var(--text-inverse)',
            background: 'var(--accent)', border: 'none', borderRadius: '2px',
            padding: '0.5rem 1.2rem', cursor: 'pointer', transition: 'opacity 0.2s',
          }}
          className="hover:opacity-85"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  /* ─── Initial loading skeletons ─── */
  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <div className={className}>
        {[...Array(4)].map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.022em', color: 'var(--text)', marginBottom: '0.5rem' }}>
          {t('post.noStories')}
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {t('post.beFirst')}
        </p>
      </div>
    );
  }

  const prevCount = prevCountRef.current;

  return (
    <div className={className}>
      <InfiniteScroll
        dataLength={flatPosts.length}
        next={fetchMore}
        hasMore={!isReachingEnd}
        loader={
          <div style={{ marginTop: '2rem' }}>
            {[...Array(2)].map((_, i) => <PostSkeleton key={`l-${i}`} />)}
          </div>
        }
        endMessage={
          flatPosts.length > 0 && (
            <p
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
                padding: '2.5rem 0',
                marginTop: '1rem',
              }}
            >
              {t('post.reachedEnd')}
            </p>
          )
        }
      >
        <div>
          {flatPosts.map((post, index) => (
            <React.Fragment key={`${post.id}-${index}`}>
              {index < prevCount ? (
                // Already-visible items: plain div — no animation overhead
                <div>
                  <BasePostItem post={post} variant={variant} />
                </div>
              ) : (
                // New batch: animate in with stagger
                <motion.div
                  variants={newItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: (index - prevCount) * 0.07 }}
                >
                  <BasePostItem post={post} variant={variant} />
                </motion.div>
              )}
              {interstitial &&
                index === interstitial.afterIndex &&
                flatPosts.length > interstitial.afterIndex + 1 &&
                interstitial.element}
            </React.Fragment>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default PostList;
