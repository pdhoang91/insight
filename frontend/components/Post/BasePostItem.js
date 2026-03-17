'use client';
// components/Post/BasePostItem.js — Warm Dispatch edition
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEdit, FaTrash, FaEllipsisH, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import { AddCommentForm, LimitedCommentList } from '../Comment';
import { useClapsCount } from '../../hooks/useClapsCount';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { deletePost } from '../../services/postService';

/* Format date as "Jan 15" — used in the left date column */
const formatDateShort = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatYear = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).getFullYear();
};

// variant: 'default' | 'compact' | 'horizontal' | 'profile'
const BasePostItem = ({
  post,
  variant = 'default',
  isOwner = false,
  showComments = true,
}) => {
  if (!post) return null;

  const router = useRouter();
  const { user } = useUser();
  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const { comments, totalCount, isLoading, mutate, canLoadMore, loadMore } =
    useInfiniteComments(post.id, isCommentsOpen, 3);

  const handleClap = async () => {
    if (!user) return;
    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (e) {
      console.error('Clap failed:', e);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      router.refresh();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  /* ─── Compact: sidebar popular posts ─── */
  if (variant === 'compact') {
    return (
      <article style={{ paddingBottom: '0.875rem', marginBottom: '0.875rem', borderBottom: '1px solid var(--border)' }} className="last:border-0 last:pb-0 last:mb-0">
        <Link href={`/p/${post.slug}`} className="block group">
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '-0.012em',
              color: 'var(--text)',
              lineHeight: 1.4,
              marginBottom: '0.3rem',
              position: 'relative',
              display: 'inline',
            }}
            className="post-title-hover"
          >
            {post.title}
          </h4>
          <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--text-faint)', letterSpacing: '0.01em' }}>
              <TimeAgo timestamp={post.created_at} />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  /* ─── Horizontal: related posts / search ─── */
  if (variant === 'horizontal') {
    return (
      <article className="group" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }} >
        <Link href={`/p/${post.slug}`} style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
          {post.cover_image && (
            <div style={{ flexShrink: 0, width: 72, height: 72, overflow: 'hidden', background: 'var(--bg-surface)' }}>
              <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
                letterSpacing: '-0.015em', color: 'var(--text)', lineHeight: 1.35,
                marginBottom: '0.3rem', display: 'inline', position: 'relative',
              }}
              className="post-title-hover"
            >
              {post.title}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '0.3rem', fontFamily: 'var(--font-body)' }} className="line-clamp-2">
              <TextUtils html={post.excerpt} maxLength={80} />
            </p>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--text-faint)', display: 'block', marginTop: '0.35rem' }}>
              <TimeAgo timestamp={post.created_at} />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  /* ─── Shared engagement row ─── */
  const actionsRow = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={handleClap}
          disabled={clapsLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '-0.01em',
            color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.2s', padding: 0,
          }}
          className="hover:text-[var(--accent)]"
        >
          <FaHandsClapping style={{ width: 13, height: 13 }} />
          {clapsCount > 0 && <span>{clapsCount}</span>}
        </button>

        {showComments && (
          <button
            onClick={() => setCommentsOpen(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '-0.01em',
              color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer',
              transition: 'color 0.2s', padding: 0,
            }}
            className="hover:text-[var(--text-muted)]"
          >
            <FaComment style={{ width: 12, height: 12 }} />
            {totalCount > 0 && <span>{totalCount}</span>}
          </button>
        )}
      </div>

      {(isOwner || (user && post.user?.id === user.id)) && (
        <OwnerMenu postSlug={post.slug} onDelete={handleDelete} />
      )}
    </div>
  );

  const commentsSection = showComments && isCommentsOpen && (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
      <AddCommentForm postId={post.id} user={user} onCommentAdded={mutate} />
      <div style={{ marginTop: '1rem' }}>
        <LimitedCommentList
          comments={comments ? comments.flat() : []}
          postId={post.id}
          mutate={mutate}
          canLoadMore={canLoadMore}
          loadMore={loadMore}
          isLoadingMore={isLoading}
          totalCount={totalCount || 0}
        />
      </div>
    </div>
  );

  /* ─── Default + Profile variant: date-column grid ─── */
  const thumbnailEl = post.cover_image && (
    <Link href={`/p/${post.slug}`} style={{ flexShrink: 0, display: 'block' }}>
      <div style={{ width: 100, aspectRatio: '1', overflow: 'hidden', background: 'var(--bg-surface)' }} className="hidden lg:block">
        <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
    </Link>
  );

  return (
    <article
      style={{
        borderBottom: '1px solid var(--border)',
        paddingBottom: '2rem',
        marginBottom: '2rem',
      }}
      className="last:border-0 last:pb-0 last:mb-0"
    >
      {/* Date-column grid: [date col] [content] [optional thumb] */}
      <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '0 1.5rem', alignItems: 'start' }}>

        {/* Left date column */}
        <div
          aria-label={`Published ${formatDateShort(post.created_at)} ${formatYear(post.created_at)}`}
          style={{ paddingTop: '0.2rem', userSelect: 'none' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--text)',
            }}
          >
            {formatDateShort(post.created_at)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '0.72rem',
              color: 'var(--text-faint)',
              letterSpacing: '0.01em',
              marginTop: '0.1rem',
            }}
          >
            {formatYear(post.created_at)}
          </div>
        </div>

        {/* Right content column */}
        <div style={{ minWidth: 0, display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/p/${post.slug}`} style={{ display: 'block' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  letterSpacing: '-0.022em',
                  lineHeight: 1.3,
                  color: 'var(--text)',
                  marginBottom: '0.5rem',
                  display: 'inline',
                  position: 'relative',
                }}
                className="post-title-hover"
              >
                {post.title}
              </h2>
            </Link>

            {post.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginTop: '0.4rem',
                  marginBottom: 0,
                }}
                className="line-clamp-2"
              >
                <TextUtils html={post.excerpt} maxLength={180} />
              </p>
            )}

            {/* Categories */}
            {post.categories?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.6rem' }}>
                {post.categories.slice(0, 3).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.name}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: 'var(--text-faint)',
                      padding: '0.2rem 0.5rem',
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

            {actionsRow}
          </div>

          {/* Thumbnail (desktop only) */}
          {post.cover_image && (
            <Link href={`/p/${post.slug}`} style={{ flexShrink: 0 }} className="hidden lg:block">
              <div style={{ width: 88, height: 88, overflow: 'hidden', background: 'var(--bg-surface)' }}>
                <img
                  src={post.cover_image}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  loading="lazy"
                  className="group-hover:scale-105"
                />
              </div>
            </Link>
          )}
        </div>
      </div>

      {commentsSection}
    </article>
  );
};

const OwnerMenu = ({ postSlug, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          padding: '4px', color: 'var(--text-faint)', background: 'none', border: 'none',
          cursor: 'pointer', transition: 'color 0.2s',
        }}
        className="hover:text-[var(--text-muted)]"
      >
        <FaEllipsisH style={{ width: 14, height: 14 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: '4px',
          background: 'var(--bg)', border: '1px solid var(--border-mid)',
          borderRadius: '3px', boxShadow: 'var(--shadow-md)',
          padding: '4px 0', zIndex: 20, minWidth: 130,
        }}>
          <Link
            href={`/edit/${postSlug}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '-0.01em',
              color: 'var(--text)', transition: 'background 0.15s',
            }}
            className="hover:bg-[var(--bg-surface)]"
          >
            <FaEdit style={{ width: 11, height: 11, color: 'var(--text-muted)' }} />
            Edit
          </Link>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 14px', textAlign: 'left',
              fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '-0.01em',
              color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            className="hover:bg-[var(--bg-surface)]"
          >
            <FaTrash style={{ width: 11, height: 11 }} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default BasePostItem;
