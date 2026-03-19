import HomeClient from './HomeClient';
import { fetchHomeData } from '../lib/api';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 120;

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let initialHomeData = null;
  try {
    initialHomeData = await fetchHomeData();
  } catch (e) {
    // Fallback to client-side fetching
  }

  return <HomeClient initialHomeData={initialHomeData} />;
}
