// components/Archive/Archive.js
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const Archive = ({ posts = [], className = '', limit = 12 }) => {
  const t = useTranslations();
  const locale = useLocale();
  const [isShowingAll, setIsShowingAll] = useState(false);

  const createArchiveList = (posts) => {
    const grouped = {};
    posts.forEach(post => {
      const date = new Date(post.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = { year, month, posts: [] };
      }
      grouped[key].posts.push(post);
    });

    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map(key => ({
        key,
        year: grouped[key].year,
        month: grouped[key].month,
        count: grouped[key].posts.length,
      }));
  };

  const archiveList = createArchiveList(posts);
  const displayList = isShowingAll ? archiveList : archiveList.slice(0, limit);

  const formatMonth = (year, month) =>
    new Date(year, month).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

  if (!posts.length) {
    return (
      <div className={className}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--text-faint)' }}>{t('archive.noPosts')}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {displayList.map(({ key, year, month, count }) => (
          <Link
            key={key}
            href={`/archive/${year}/${month + 1}`}
            style={{
              display: 'block',
              padding: '0.3rem 0',
              fontFamily: 'var(--font-display)',
              fontSize: '0.82rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text-muted)',
              transition: 'color 0.2s',
              borderBottom: '1px solid rgba(26, 20, 16, 0.06)',
            }}
            className="hover:text-[var(--text)]"
          >
            {formatMonth(year, month)}
            <span
              style={{
                marginLeft: '0.4rem',
                fontSize: '0.68rem',
                color: 'var(--text-faint)',
                letterSpacing: '0.02em',
              }}
            >
              {count}
            </span>
          </Link>
        ))}

        {archiveList.length > limit && (
          <div style={{ paddingTop: '0.5rem' }}>
            <button
              onClick={() => setIsShowingAll(!isShowingAll)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'opacity 0.2s',
              }}
              className="hover:opacity-70"
            >
              {isShowingAll ? t('archive.recentOnly') : t('archive.allMonths', { count: archiveList.length })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
