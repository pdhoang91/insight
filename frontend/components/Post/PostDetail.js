'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import SEOHead from '../SEO/SEOHead';
import RelatedPosts from './RelatedPosts';
import { renderPostContent, getContentPlainText } from '../../utils/renderContent';
import { useTranslations, useLocale } from 'next-intl';

const AuthorByline = ({ user: postUser, date }) => {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--bg-surface)', overflow: 'hidden', flexShrink: 0,
        border: '1.5px solid var(--border)',
      }}>
        {postUser?.avatar_url ? (
          <img src={postUser.avatar_url} alt={postUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaUser style={{ width: 14, height: 14, color: 'var(--text-faint)' }} />
          </div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>
          {postUser?.name || t('article.anonymous')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
          <time dateTime={date} style={{ fontFamily: 'var(--font-display)', fontSize: '0.775rem', color: 'var(--text-faint)', letterSpacing: '0.01em' }}>
            {new Date(date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
        </div>
      </div>
    </div>
  );
};



export const PostDetail = ({ post, relatedPosts = [] }) => {
  const t = useTranslations();
  if (!post) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
        {t('common.loading')}
      </div>
    );
  }

  const renderedHTML = useMemo(() => renderPostContent(post.content), [post.content]);
  const plainText = useMemo(() => getContentPlainText(post.content), [post.content]);

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || plainText?.substring(0, 160)}
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
              <Link
                key={cat.id || cat.name}
                href={`/category/${cat.name}`}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-faint)',
                  padding: '0.25rem 0.65rem',
                  background: 'var(--bg-surface)',
                  borderRadius: '2px',
                  transition: 'color 0.2s, background 0.2s',
                }}
                className="hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
              >
                {cat.name}
              </Link>
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
