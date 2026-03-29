'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SEOHead from '../SEO/SEOHead';
import RelatedPosts from './RelatedPosts';
import { formatDate } from '../../utils/formatDate';
import { useTranslations, useLocale } from 'next-intl';
import { Clock, User, ChatCircle } from '@phosphor-icons/react';

// htmlContent: pre-rendered HTML from server (avoids shipping TipTap to client).
// Falls back to lazy client-side rendering only when htmlContent is not provided.
export const PostDetail = ({ post, htmlContent, relatedPosts = [] }) => {
  const t = useTranslations();
  const locale = useLocale();
  const [renderedHTML, setRenderedHTML] = useState(htmlContent || '');

  useEffect(() => {
    if (htmlContent) return;
    if (!post?.content) return;

    import('../../utils/renderContent').then(({ renderPostContent }) => {
      const html = renderPostContent(post.content);
      if (html) setRenderedHTML(html);
    });
  }, [post?.id, htmlContent]);

  if (!post) {
    return (
      <div className="flex items-center justify-center h-60 font-display text-[var(--text-muted)]">
        {t('common.loading')}
      </div>
    );
  }

  const description = post.excerpt || renderedHTML.replace(/<[^>]*>/g, '').substring(0, 160);

  return (
    <>
      <SEOHead
        title={post.title}
        description={description}
        image={post.cover_image}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        author={post.user?.name}
        category={post.category}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/p/${post.slug}`}
      />

      <article className="animate-fade-up">

        {/* Categories */}
        {post.categories?.length > 0 && (
          <div className="mb-3">
            {post.categories.map((cat, i) => (
              <React.Fragment key={`${cat.id || ''}-${cat.name}-${i}`}>
                {i > 0 && <span className="ui-label mx-[0.25rem]">,</span>}
                <Link href={`/category/${cat.name.toLowerCase()}`} className="category-overline">
                  {cat.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="post-detail-title">{post.title}</h1>

        {/* Meta row */}
        <div className="post-detail-meta">
          <span className="flex items-center gap-[0.35rem]">
            <Clock size={13} weight="regular" />
            {formatDate(post.created_at, locale)}
          </span>
          {post.user?.name && (
            <span className="flex items-center gap-[0.35rem]">
              <User size={13} weight="regular" />
              {post.user.name}
            </span>
          )}
          <Link href="#comments" className="flex items-center gap-[0.35rem] hover:text-[var(--accent)] transition-colors">
            <ChatCircle size={13} weight="regular" />
            {t('post.leaveComment')}
          </Link>
        </div>

        {/* Body */}
        <div
          className="post-content reading-content"
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-[0.4rem] mt-8">
            {post.tags.map((tag, i) => (
              <Link key={`${tag.id || ''}-${tag.name}-${i}`} href={`/tag/${tag.name}`} className="tag-chip">
                • {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Categories (bottom) */}
        {post.categories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.categories.map((cat, i) => (
              <Link
                key={`bottom-${cat.id || ''}-${cat.name}-${i}`}
                href={`/category/${cat.name.toLowerCase()}`}
                className="taxonomy-pill"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
          </div>
        )}
      </article>
    </>
  );
};

export default PostDetail;
