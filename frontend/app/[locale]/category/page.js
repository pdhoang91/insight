import CategoryPageClient from './CategoryPageClient';
import { fetchCategories } from '../../lib/api';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export const metadata = {
  title: 'Danh mục',
  description: 'Khám phá bài viết theo danh mục',
};

export default async function CategoryPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  let categories = [];

  try {
    categories = await fetchCategories();
  } catch {
    // Fallback to client-side fetching
  }

  return <CategoryPageClient initialCategories={categories} />;
}
