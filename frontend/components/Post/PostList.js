'use client';
// components/Post/PostList.js — Warm Dispatch with staggered entry
import React, { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import BasePostItem from './BasePostItem';
import PostItemSkeleton from './PostItemSkeleton';
import ErrorState from '../UI/ErrorState';

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
      <ErrorState
        title={t('post.errorOccurred')}
        message={t('post.loadFailed')}
        action={{ label: t('common.retry'), onClick: () => window.location.reload() }}
      />
    );
  }

  /* ─── Initial loading skeletons ─── */
  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <div className={className}>
        {[...Array(4)].map((_, i) => <PostItemSkeleton key={i} />)}
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="font-display text-xl font-extrabold tracking-tight text-[var(--text)] mb-2">
          {t('post.noStories')}
        </h3>
        <p className="font-body text-sm text-[var(--text-muted)]">
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
          <div className="mt-8">
            {[...Array(2)].map((_, i) => <PostItemSkeleton key={`l-${i}`} />)}
          </div>
        }
        endMessage={
          flatPosts.length > 0 && (
            <p className="end-message">{t('post.reachedEnd')}</p>
          )
        }
      >
        <div>
          {flatPosts.map((post, index) => (
            <React.Fragment key={`${post.id}-${index}`}>
              {index < prevCount ? (
                // Already-visible items: plain div — no animation overhead
                <div className="pb-20">
                  <BasePostItem post={post} variant={variant} priority={index === 0} />
                </div>
              ) : (
                // New batch: animate in with stagger
                <motion.div
                  className="pb-20"
                  variants={newItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: (index - prevCount) * 0.07 }}
                >
                  <BasePostItem post={post} variant={variant} priority={index === 0} />
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
