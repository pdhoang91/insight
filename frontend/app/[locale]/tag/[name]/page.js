import TagPostsClient from './TagPostsClient';
import { fetchPopularTags } from '../../../lib/api';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const tags = await fetchPopularTags(20);
    return tags.map((tag) => ({ name: tag.name }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { locale, name } = await params;
  setRequestLocale(locale);
  const decodedName = decodeURIComponent(name);
  return {
    title: `#${decodedName}`,
    description: `Posts tagged with #${decodedName}`,
  };
}

export default async function TagPostsPage({ params }) {
  const { locale, name } = await params;
  setRequestLocale(locale);
  return <TagPostsClient name={name} />;
}
