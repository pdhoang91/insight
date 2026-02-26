import ArchivePageClient from './ArchivePageClient';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata({ params }) {
  const { locale, year, month } = params;
  setRequestLocale(locale);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthInt = parseInt(month);
  const monthName = monthNames[monthInt - 1] || '';
  return {
    title: `Archive: ${monthName} ${year}`,
    description: `Bài viết lưu trữ tháng ${monthName} năm ${year}`,
  };
}

export default async function ArchivePage({ params }) {
  const { locale, year, month } = params;
  setRequestLocale(locale);
  return <ArchivePageClient year={year} month={month} />;
}
