// components/Archive/Archive.js
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

// archiveList = [{ year, month, count }, ...] — server-provided, month is 1-based
const Archive = ({ archiveList = [], className = '', limit = 12 }) => {
  const t = useTranslations();
  const locale = useLocale();
  const [isShowingAll, setIsShowingAll] = useState(false);

  const displayList = isShowingAll ? archiveList : archiveList.slice(0, limit);

  // month is 1-based from server (SQL EXTRACT)
  const formatMonth = (year, month) =>
    new Date(year, month - 1).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

  if (!archiveList.length) {
    return (
      <div className={className}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--text-faint)' }}>{t('archive.noPosts')}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-1">
        {displayList.map(({ year, month, count }) => (
          <Link
            key={`${year}-${month}`}
            href={`/archive/${year}/${month}`}
            style={{
              display: 'block',
              padding: '0.3rem 0',
              fontFamily: 'var(--font-display)',
              fontSize: '0.82rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--text-muted)',
              transition: 'color 0.2s',
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
