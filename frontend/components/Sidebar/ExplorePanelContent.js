'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useHomeData } from '../../hooks/useHomeData';
import { useArchiveSummary } from '../../hooks/useArchiveSummary';
import { fetchPopularTags } from '../../app/lib/api';
import Archive from '../Archive/Archive';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const SectionLabel = ({ children }) => (
  <p
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: '0.6rem',
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      margin: '0 0 0.9rem 0',
    }}
  >
    {children}
  </p>
);

const ExplorePanelContent = ({ onClose }) => {
  const t = useTranslations();
  const { categories, popularPosts, isLoading } = useHomeData();
  const { archiveList } = useArchiveSummary();
  const { data: popularTags, isLoading: tagsLoading } = useSWR(
    '/tags/popular',
    () => fetchPopularTags(20),
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
    >
      {/* ─ Popular Posts ─ */}
      {(isLoading || popularPosts.length > 0) && (
        <motion.div
          variants={itemVariant}
          style={{
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <SectionLabel>{t('sidebar.popularPosts')}</SectionLabel>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-warm"
                  style={{ height: '0.875rem', width: `${60 + (i % 3) * 15}%`, borderRadius: '2px' }}
                />
              ))}
            </div>
          ) : (
            <div>
              {popularPosts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  href={`/p/${post.slug}`}
                  onClick={onClose}
                  className="group block"
                  style={{
                    padding: '0.55rem 0',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      lineHeight: 1.4,
                      letterSpacing: '-0.01em',
                      color: 'var(--text)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      transition: 'color 0.2s',
                    }}
                    className="group-hover:text-[var(--accent)]"
                  >
                    {post.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ─ Categories ─ */}
      {(isLoading || categories.length > 0) && (
        <motion.div
          variants={itemVariant}
          style={{
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <SectionLabel>{t('sidebar.categories')}</SectionLabel>
          {isLoading ? (
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
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.name.toLowerCase()}`}
                  onClick={onClose}
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
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ─ Tags ─ */}
      {(tagsLoading || (popularTags && popularTags.length > 0)) && (
        <motion.div
          variants={itemVariant}
          style={{
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <SectionLabel>{t('sidebar.tags')}</SectionLabel>
          {tagsLoading ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-warm"
                  style={{ height: `${14 + (i % 4) * 4}px`, width: `${45 + (i % 5) * 18}px`, borderRadius: '2px' }}
                />
              ))}
            </div>
          ) : (
            <div style={{ lineHeight: 1.8 }}>
              {(popularTags || []).slice(0, 40).map((tag, i) => {
                const total = Math.min((popularTags || []).length, 40);
                const rank = i / total;
                const fontSize =
                  rank < 0.1 ? '1.4rem' :
                  rank < 0.2 ? '1.15rem' :
                  rank < 0.4 ? '0.95rem' :
                  rank < 0.65 ? '0.82rem' :
                  '0.72rem';
                const fontWeight = rank < 0.2 ? 700 : rank < 0.4 ? 600 : 400;
                return (
                  <Link
                    key={tag.id || tag.name}
                    href={`/tag/${tag.name}`}
                    onClick={onClose}
                    style={{
                      display: 'inline-block',
                      marginRight: '0.5rem',
                      fontSize,
                      fontWeight,
                      color: 'var(--accent)',
                      textDecoration: 'none',
                    }}
                    className="hover:underline"
                  >
                    {tag.name}
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ─ Archive ─ */}
      <motion.div
        variants={itemVariant}
        style={{ paddingBottom: '0.5rem' }}
      >
        <SectionLabel>{t('sidebar.archive')}</SectionLabel>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            letterSpacing: '-0.01em',
          }}
        >
          <Archive archiveList={archiveList} limit={6} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExplorePanelContent;
