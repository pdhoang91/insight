import HomeClient from './HomeClient';
import { fetchPosts, fetchPopularPosts } from '../lib/api';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  let initialPosts = [];
  let totalCount = 0;

  try {
    const data = await fetchPosts(1, 10);
    initialPosts = data.posts;
    totalCount = data.total;
  } catch (e) {
    // Fallback to client-side fetching
  }

  return <HomeClient initialPosts={initialPosts} totalCount={totalCount} />;
}
