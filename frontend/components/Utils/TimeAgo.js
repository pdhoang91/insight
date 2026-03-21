
// src/components/Utils/TimeAgo.js
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

// Pure function - accepts optional locale and t() for server-side or legacy use
export const timeAgo = (date, locale = 'en', t = null) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);

  if (seconds >= 86400) {
    const dateObj = new Date(date);
    const localeStr = locale === 'vi' ? 'vi-VN' : 'en-US';
    const month = dateObj.toLocaleString(localeStr, { month: 'short' });
    const day = dateObj.getDate();
    return `${month} ${day}`;
  }

  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    if (t) return t('timeago.hoursAgo', { hours });
    return `${hours} hours ago`;
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    if (t) return t('timeago.minutesAgo', { minutes });
    return `${minutes} minutes ago`;
  }

  if (t) return t('timeago.justNow');
  return 'just now';
};

// Component TimeAgo — locale-aware
const TimeAgo = ({ timestamp }) => {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <span
      className="text-body-small text-medium-text-secondary inline-flex items-center space-x-1"
      style={{ fontFamily: 'inherit' }}
    >
      <span>{timeAgo(timestamp, locale, t)}</span>
    </span>
  );
};

export default TimeAgo;
