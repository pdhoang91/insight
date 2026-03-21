import ArchivePageClient from './ArchivePageClient';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata({ params }) {
  const { locale, year, month } = await params;
  setRequestLocale(locale);
  const monthInt = parseInt(month);
  const localeStr = locale === 'vi' ? 'vi-VN' : 'en-US';
  const monthName = !isNaN(monthInt) && monthInt >= 1 && monthInt <= 12
    ? new Date(parseInt(year), monthInt - 1, 1).toLocaleString(localeStr, { month: 'long' })
    : '';

  if (locale === 'vi') {
    return {
      title: `Lưu trữ: ${monthName} ${year}`,
      description: `Bài viết lưu trữ tháng ${monthName} năm ${year}`,
    };
  }

  return {
    title: `Archive: ${monthName} ${year}`,
    description: `Posts archived from ${monthName} ${year}`,
  };
}

export default async function ArchivePage({ params }) {
  const { locale, year, month } = await params;
  setRequestLocale(locale);
  return <ArchivePageClient year={year} month={month} />;
}
