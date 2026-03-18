import CategoryPostsClient from './CategoryPostsClient';
import { fetchPopularCategories, fetchPostsByCategory } from '../../../lib/api';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export async function generateStaticParams() {
  try {
    const categories = await fetchPopularCategories(10);
    return categories.map((cat) => ({ name: cat.name || cat.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { locale, name } = await params;
  setRequestLocale(locale);
  const decodedName = decodeURIComponent(name);
  return {
    title: `Danh mục: ${decodedName}`,
    description: `Bài viết trong danh mục ${decodedName}`,
  };
}

export default async function CategoryPostsPage({ params }) {
  const { locale, name } = await params;
  setRequestLocale(locale);
  return <CategoryPostsClient name={name} />;
}
