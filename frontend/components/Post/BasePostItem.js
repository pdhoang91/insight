'use client';
// components/Post/BasePostItem.js — Warm Dispatch edition
import React from 'react';
import Link from 'next/link';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import { useUser } from '../../context/UserContext';
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
  showOwnerActions = false,
}) => {
  if (!post) return null;

  const router = useRouter();
  const { user } = useUser();

  const isPostOwner =
    showOwnerActions ||
    (variant === 'profile' && user?.id != null && user.id === post.user?.id);

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

  /* ─── Default + Profile variant: date-column grid ─── */
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

            {isPostOwner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.875rem' }}>
                <Link
                  href={`/edit/${post.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    padding: '0.25rem 0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                  className="hover:text-[var(--text)] hover:border-[var(--border-mid)]"
                >
                  <FaEdit style={{ width: 10, height: 10 }} />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                    padding: '0.25rem 0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                  className="hover:text-[#DC2626] hover:border-[#DC2626]/30"
                >
                  <FaTrash style={{ width: 10, height: 10 }} />
                  Delete
                </button>
              </div>
            )}
          </div>

          {post.cover_image && (
            <Link href={`/p/${post.slug}`} style={{ flexShrink: 0 }} className="hidden md:block">
              <div style={{ width: 112, height: 112, overflow: 'hidden', background: 'var(--bg-surface)' }}>
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
    </article>
  );
};

export default BasePostItem;
