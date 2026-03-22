// utils/formatDate.js

/**
 * Formats a date string to a localized long date (e.g. "March 23, 2026").
 * @param {string|Date} date
 * @param {string} locale - next-intl locale string ('vi' | 'en')
 * @returns {string}
 */
export const formatDate = (date, locale = 'en') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(
    locale === 'vi' ? 'vi-VN' : 'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  );
};
