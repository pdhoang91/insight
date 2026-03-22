import { cache } from 'react';
import { fetchAllPostSlugs, fetchPostBySlug } from '../../../lib/api';
import { setRequestLocale } from 'next-intl/server';
import PostPageClient from './PostPageClient';
import { renderPostContent } from '../../../../utils/renderContentServer';

const getCachedPost = cache(fetchPostBySlug);

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateStaticParams() {
  try {
    const slugs = await fetchAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  try {
    const post = await getCachedPost(slug);
    if (!post) return { title: 'Post Not Found' };
    return {
      title: post.title,
      description: post.excerpt || '',
      openGraph: {
        title: post.title,
        description: post.excerpt || '',
        images: post.cover_image ? [{ url: post.cover_image }] : [],
      },
    };
  } catch {
    return { title: 'Post' };
  }
}

export default async function PostPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  let post = null;
  let initialHtml = null;

  try {
    post = await getCachedPost(slug);
    if (post?.content) {
      initialHtml = renderPostContent(post.content);
    }
  } catch {
    // Fallback to client-side fetching
  }

  return <PostPageClient slug={slug} initialPost={post} initialHtml={initialHtml} />;
}
