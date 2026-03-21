'use client';
// components/Post/BasePostItem.js — Warm Dispatch edition
import React from 'react';
import Link from 'next/link';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import { useUser } from '../../context/UserContext';
import { deletePost } from '../../services/postService';
import { useTranslations } from 'next-intl';

// variant: 'default' | 'compact' | 'horizontal' | 'profile'
const BasePostItem = ({
  post,
  variant = 'default',
  showOwnerActions = false,
}) => {
  if (!post) return null;

  const router = useRouter();
  const { user } = useUser();
  const t = useTranslations();

  const isPostOwner =
    showOwnerActions ||
    (variant === 'profile' && user?.id != null && user.id === post.user?.id);

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirmDelete'))) return;
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
      <article style={{ paddingBottom: '0.875rem', marginBottom: '0.875rem' }} className="last:pb-0 last:mb-0">
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
      <article className="group" style={{ paddingBottom: '1rem', marginBottom: '1rem' }} >
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

  /* ─── Default + Profile variant ─── */
  return (
    <article
      style={{ paddingBottom: '2rem', marginBottom: '2rem' }}
      className="last:pb-0 last:mb-0"
    >
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Content */}
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

          {/* Metadata row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--text-faint)', letterSpacing: '0.01em' }}>
              <TimeAgo timestamp={post.created_at} />
            </span>

            {isPostOwner && (
              <>
                <Link
                  href={`/edit/${post.slug}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
                    letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-faint)',
                    padding: '0.25rem 0.6rem', border: '1px solid var(--border)', borderRadius: '2px',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                  className="hover:text-[var(--text)] hover:border-[var(--border-mid)]"
                >
                  <PencilSimple style={{ width: 10, height: 10 }} />
                  {t('common.edit')}
                </Link>
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
                    letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-faint)',
                    padding: '0.25rem 0.6rem', border: '1px solid var(--border)', borderRadius: '2px',
                    background: 'none', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
                  }}
                  className="hover:text-[#DC2626] hover:border-[#DC2626]/30"
                >
                  <Trash style={{ width: 10, height: 10 }} />
                  {t('common.delete')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail */}
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
    </article>
  );
};

export default BasePostItem;
