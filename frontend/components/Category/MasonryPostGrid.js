'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { useTranslations, useLocale } from 'next-intl';

const MasonryPostGrid = ({ posts = [], isLoading, setSize, isReachingEnd }) => {
  const t = useTranslations();
  const locale = useLocale();
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (isReachingEnd || loadingMore) return;
    setLoadingMore(true);
    try {
      await setSize((prev) => prev + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [setSize, isReachingEnd, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    const target = document.getElementById('load-more-trigger');
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, [handleLoadMore, isReachingEnd, loadingMore]);

  if (!posts || posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-px border border-[var(--border)] rounded-[4px] overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
        }}
      >
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} locale={locale} t={t} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load more trigger */}
      <div id="load-more-trigger" className="pt-12 flex justify-center">
        {loadingMore && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loading-text"
          >
            {t('category.loadingMore')}
          </motion.p>
        )}

        {isReachingEnd && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4"
          >
            <span className="separator-line" />
            <span className="ui-label-caps">{t('category.allPostsShown')}</span>
            <span className="separator-line" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, index, locale, t }) => {
  const dateStr = post.created_at
    ? new Date(post.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';

  return (
    <motion.article
      layout
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
      }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="group bg-[var(--bg-surface)] border-r border-[var(--border)]"
    >
      <Link href={`/p/${post.slug}`} className="block p-7 no-underline">
        {/* Cover image */}
        {post.cover_image && (
          <div className="w-full aspect-video rounded-[2px] overflow-hidden mb-5 bg-[var(--bg-elevated)]">
            <img
              src={post.cover_image}
              alt={post.title}
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
              className="w-full h-full object-cover block transition-transform duration-400 ease-out"
            />
          </div>
        )}

        {/* Category label */}
        {post.categories?.[0]?.name && (
          <span className="category-badge">{post.categories[0].name}</span>
        )}

        {/* Title */}
        <h2 className="masonry-card-title group-hover:text-[var(--accent)]">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="post-excerpt-sm line-clamp-2 mb-4">{post.excerpt}</p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="ui-label tracking-[-0.01em]">{dateStr}</span>
            {post.reading_time && (
              <>
                <span style={{ color: 'var(--border)', fontSize: '0.6rem' }}>·</span>
                <span className="ui-label">{post.reading_time} {t('category.min')}</span>
              </>
            )}
          </div>

          <span
            className="text-[var(--accent)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          >
            <ArrowRight size={14} weight="bold" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

const EmptyState = () => {
  const t = useTranslations();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="py-20 text-center"
    >
      <p className="font-display text-[1rem] font-semibold text-ink mb-2 tracking-[-0.02em]">
        {t('category.noPostsTitle')}
      </p>
      <p className="post-excerpt-sm">
        {t('category.noPostsMessage', { categoryName: '' })}
      </p>
    </motion.div>
  );
};

export default MasonryPostGrid;
