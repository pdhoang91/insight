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
        className="grid grid-cols-1 md:grid-cols-2 gap-px"
        style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}
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
      <div id="load-more-trigger" style={{ paddingTop: '3rem', display: 'flex', justifyContent: 'center' }}>
        {loadingMore && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.78rem',
              color: 'var(--text-faint)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('category.loadingMore')}
          </motion.p>
        )}

        {isReachingEnd && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <span style={{ display: 'block', width: '2rem', height: '1px', background: 'var(--border)' }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}>
              {t('category.allPostsShown')}
            </span>
            <span style={{ display: 'block', width: '2rem', height: '1px', background: 'var(--border)' }} />
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
      className="group"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
    >
      <Link href={`/p/${post.slug}`} style={{ display: 'block', padding: '1.75rem', textDecoration: 'none' }}>
        {/* Cover image */}
        {post.cover_image && (
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
            background: 'var(--bg-elevated)',
          }}>
            <img
              src={post.cover_image}
              alt={post.title}
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
              }}
            />
          </div>
        )}

        {/* Category label */}
        {post.categories?.[0]?.name && (
          <span style={{
            display: 'inline-block',
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '0.625rem',
          }}>
            {post.categories[0].name}
          </span>
        )}

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            color: 'var(--text)',
            marginBottom: '0.625rem',
            transition: 'color 0.15s',
          }}
          className="group-hover:text-[var(--accent)]"
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              color: 'var(--text-faint)',
              letterSpacing: '-0.01em',
            }}>
              {dateStr}
            </span>
            {post.reading_time && (
              <>
                <span style={{ color: 'var(--border)', fontSize: '0.6rem' }}>·</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.72rem',
                  color: 'var(--text-faint)',
                }}>
                  {post.reading_time} {t('category.min')}
                </span>
              </>
            )}
          </div>

          <span
            style={{ color: 'var(--accent)', opacity: 0, transition: 'opacity 0.15s' }}
            className="group-hover:opacity-100"
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
      style={{ padding: '5rem 0', textAlign: 'center' }}
    >
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em',
      }}>
        {t('category.noPostsTitle')}
      </p>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        color: 'var(--text-faint)',
      }}>
        {t('category.noPostsMessage', { categoryName: '' })}
      </p>
    </motion.div>
  );
};

export default MasonryPostGrid;
