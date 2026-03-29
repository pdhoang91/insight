'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const CategoryPostsHero = ({ categoryName, totalCount }) => {
  const t = useTranslations();
  const capitalizedName = categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{ paddingBottom: '2rem' }}
    >
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { label: t('category.home'), href: '/' },
          { label: t('sidebar.categories'), href: '/category' },
        ].map(({ label, href }) => (
          <React.Fragment key={href}>
            <Link
              href={href}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-faint)',
                letterSpacing: '-0.01em',
                transition: 'color 0.15s',
              }}
              className="hover:text-[var(--text-muted)]"
            >
              {label}
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '0.7rem' }}>→</span>
          </React.Fragment>
        ))}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--accent)',
          letterSpacing: '-0.01em',
        }}>
          {capitalizedName}
        </span>
      </nav>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 5vw, 3.25rem)',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: 'var(--text)',
        lineHeight: 1.1,
        marginBottom: '0.875rem',
      }}>
        {capitalizedName}
      </h1>

      {/* Description + count */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', flexWrap: 'wrap' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          lineHeight: 1.65,
          color: 'var(--text-muted)',
          maxWidth: '56ch',
          margin: 0,
        }}>
          {t('category.categoryDescription', { categoryName })}
        </p>

        {totalCount > 0 && (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            flexShrink: 0,
          }}>
            {totalCount} {t('category.articles')}
          </span>
        )}
      </div>
    </motion.section>
  );
};

export default CategoryPostsHero;
