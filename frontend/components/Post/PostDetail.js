'use client';
import React, { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaShare } from 'react-icons/fa6';
import { FaComment, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { deletePost } from '../../services/postService';
import { useComments } from '../../hooks/useComments';
import SEOHead from '../SEO/SEOHead';
import RelatedPosts from './RelatedPosts';
import { renderPostContent, getContentPlainText } from '../../utils/renderContent';

const ReadingProgressBar = () => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setWidth(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div
      className="reading-progress-bar"
      style={{ width: `${width}%` }}
      role="progressbar"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
};

const AuthorByline = ({ user: postUser, readTime, date }) => (
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
        {postUser?.name || 'Anonymous'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.775rem', color: 'var(--text-faint)', letterSpacing: '0.01em' }}>
          {readTime} min read
        </span>
        <span style={{ color: 'var(--border-mid)', fontSize: '0.6rem' }}>◆</span>
        <time dateTime={date} style={{ fontFamily: 'var(--font-display)', fontSize: '0.775rem', color: 'var(--text-faint)', letterSpacing: '0.01em' }}>
          {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </time>
      </div>
    </div>
  </div>
);

const EngagementRow = ({ onClap, hasClapped, clapsCount, onCommentClick, commentCount, isOwner, postSlug, onDelete, onShare }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '1.25rem',
    marginTop: '2rem',
    borderTop: '1px solid var(--border)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <button
        onClick={onClap}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '-0.01em',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: hasClapped ? 'var(--accent)' : 'var(--text-faint)',
          transition: 'color 0.2s',
        }}
        className="hover:text-[var(--accent)]"
        title="Appreciate"
      >
        <FaHandsClapping style={{ width: 16, height: 16 }} />
        {clapsCount > 0 && <span>{clapsCount}</span>}
      </button>

      <button
        onClick={onCommentClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '-0.01em',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'var(--text-faint)', transition: 'color 0.2s',
        }}
        className="hover:text-[var(--text-muted)]"
        title="Comments"
      >
        <FaComment style={{ width: 14, height: 14 }} />
        {commentCount > 0 && <span>{commentCount}</span>}
      </button>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      {isOwner && (
        <>
          <Link
            href={`/edit/${postSlug}`}
            style={{ color: 'var(--text-faint)', transition: 'color 0.2s' }}
            className="hover:text-[var(--text-muted)]"
            title="Edit"
          >
            <FaEdit style={{ width: 13, height: 13 }} />
          </Link>
          <button
            onClick={onDelete}
            style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
            className="hover:text-[#DC2626]"
            title="Delete"
          >
            <FaTrash style={{ width: 13, height: 13 }} />
          </button>
        </>
      )}
      <button
        onClick={onShare}
        style={{ color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
        className="hover:text-[var(--text-muted)]"
        title="Copy link"
      >
        <FaShare style={{ width: 13, height: 13 }} />
      </button>
    </div>
  </div>
);

export const PostDetail = ({ post, relatedPosts = [], onScrollToComments }) => {
  if (!post) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
        Loading...
      </div>
    );
  }

  const router = useRouter();
  const { clapsCount: postClapsCount, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { totalCommentReply } = useComments(post.id, true, 1, 10);
  const isOwner = user && post.user && user.id === post.user.id;

  const renderedHTML = useMemo(() => renderPostContent(post.content), [post.content]);
  const plainText = useMemo(() => getContentPlainText(post.content), [post.content]);
  const readTime = Math.max(1, Math.ceil((plainText?.length || 0) / 1000));

  const handleClap = async () => {
    if (!user) return;
    try { await clapPost(post.id); mutateClaps(); } catch (e) { console.error(e); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/p/${post.slug}`;
    navigator.clipboard.writeText(url);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await deletePost(post.id); router.push('/'); } catch (e) { console.error(e); }
  };

  return (
    <>
      <ReadingProgressBar />
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

      <article className="animate-fade-up" style={{ maxWidth: 'var(--reading-width)', margin: '0 auto' }}>
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

        <AuthorByline user={post.user} readTime={readTime} date={post.created_at} />

        {post.cover_image && (
          <div style={{ margin: '2.5rem 0' }}>
            <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} loading="eager" />
          </div>
        )}

        <div
          className="post-content reading-content"
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
          style={{ marginTop: post.cover_image ? 0 : '2rem' }}
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

        <EngagementRow
          onClap={handleClap}
          hasClapped={hasClapped}
          clapsCount={postClapsCount}
          onCommentClick={onScrollToComments}
          commentCount={totalCommentReply}
          isOwner={isOwner}
          postSlug={post.slug}
          onDelete={handleDelete}
          onShare={handleShare}
        />

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
