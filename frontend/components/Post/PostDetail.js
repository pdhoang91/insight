'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SEOHead from '../SEO/SEOHead';
import Avatar from '../UI/Avatar';
import RelatedPosts from './RelatedPosts';
import { formatDate } from '../../utils/formatDate';
import { useTranslations, useLocale } from 'next-intl';

const AuthorByline = ({ user: postUser, date }) => {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
      <Avatar
        src={postUser?.avatar_url}
        name={postUser?.name}
        size="md"
        style={{ flexShrink: 0 }}
      />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>
          {postUser?.name || t('article.anonymous')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
          <time dateTime={date} style={{ fontFamily: 'var(--font-display)', fontSize: '0.775rem', color: 'var(--text-faint)', letterSpacing: '0.01em' }}>
            {formatDate(date, locale)}
          </time>
        </div>
      </div>
    </div>
  );
};

/** Renders a single category or tag chip link */
const TaxonomyChip = ({ href, label }) => (
  <Link
    href={href}
    style={{
      display: 'inline-block',
      padding: '0.3rem 0.85rem',
      border: '1px solid var(--border)',
      borderRadius: '9999px',
      fontFamily: 'var(--font-body)',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      textDecoration: 'none',
      background: 'var(--bg)',
      transition: 'border-color 0.2s, color 0.2s',
      whiteSpace: 'nowrap',
    }}
    className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
  >
    {label}
  </Link>
);

// htmlContent: pre-rendered HTML from server (avoids shipping TipTap to client).
// Falls back to lazy client-side rendering only when htmlContent is not provided.
export const PostDetail = ({ post, htmlContent, relatedPosts = [] }) => {
  const t = useTranslations();
  const [renderedHTML, setRenderedHTML] = useState(htmlContent || '');

  useEffect(() => {
    // Server pre-rendered HTML is available — no need to load TipTap on client
    if (htmlContent) return;
    if (!post?.content) return;

    // Lazy-load TipTap only for client-side navigation where server HTML is absent
    import('../../utils/renderContent').then(({ renderPostContent }) => {
      const html = renderPostContent(post.content);
      if (html) setRenderedHTML(html);
    });
  }, [post?.id, htmlContent]);

  if (!post) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
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
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
          lineHeight: 1.12,
          letterSpacing: '-0.028em',
          color: 'var(--text)',
          marginBottom: '1.5rem',
          marginTop: 0,
        }}>
          {post.title}
        </h1>

        <AuthorByline user={post.user} date={post.created_at} />

        <div
          className="post-content reading-content"
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
          style={{ marginTop: '2rem' }}
        />

        {post.categories?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2.5rem' }}>
            {post.categories.map((cat) => (
              <TaxonomyChip
                key={cat.id || cat.name}
                href={`/category/${cat.name.toLowerCase()}`}
                label={cat.name}
              />
            ))}
          </div>
        )}

        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            {post.tags.map((tag) => (
              <TaxonomyChip
                key={tag.id || tag.name}
                href={`/tag/${tag.name}`}
                label={`#${tag.name}`}
              />
            ))}
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
          </div>
        )}
      </article>
    </>
  );
};

export default PostDetail;
