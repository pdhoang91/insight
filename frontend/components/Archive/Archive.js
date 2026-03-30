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
    new Date(year, month - 1).toLocaleDateString(
      locale === 'vi' ? 'vi-VN' : 'en-US',
      { month: 'long', year: 'numeric' }
    );

  if (!archiveList.length) {
    return (
      <div className={className}>
        <p className="ui-label">{t('archive.noPosts')}</p>
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
            className="flex items-baseline gap-1.5 py-1.5 font-display text-[0.82rem] font-medium tracking-tight text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            {formatMonth(year, month)}
            <span className="text-[0.68rem] text-[var(--text-faint)] tracking-wide">
              {count}
            </span>
          </Link>
        ))}

        {archiveList.length > limit && (
          <div className="pt-2">
            <button
              onClick={() => setIsShowingAll(!isShowingAll)}
              className="font-display text-[0.72rem] font-semibold tracking-tight text-[var(--accent)] bg-transparent border-none cursor-pointer p-0 transition-opacity hover:opacity-70"
            >
              {isShowingAll
                ? t('archive.recentOnly')
                : t('archive.allMonths', { count: archiveList.length })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
