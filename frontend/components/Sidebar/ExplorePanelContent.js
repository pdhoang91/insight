'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useHomeData } from '../../hooks/useHomeData';
import { useArchiveSummary } from '../../hooks/useArchiveSummary';
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton-warm"
                  style={{ height: '0.8rem', width: `${55 + (i % 3) * 20}%`, borderRadius: '2px' }}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.name}`}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'var(--text-muted)',
                    padding: '0.45rem 0',
                    transition: 'color 0.2s',
                  }}
                  className="hover:text-[var(--text)]"
                >
                  <span>{cat.name}</span>
                  {cat.post_count > 0 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.68rem',
                        color: 'var(--text-faint)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {cat.post_count}
                    </span>
                  )}
                </Link>
              ))}
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
