'use client';
// components/Post/BasePostItem.js — Warm Dispatch edition
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PencilSimple, Trash, Clock, ChatCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import TextUtils from '../../utils/TextUtils';
import TimeAgo from '../UI/TimeAgo';
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

  const isLocalImage = (src) => src?.includes('localhost');

  /* ─── Compact: sidebar popular posts ─── */
  if (variant === 'compact') {
    return (
      <article className="pb-[0.875rem] mb-[0.875rem] last:pb-0 last:mb-0">
        <Link href={`/p/${post.slug}`} className="block group">
          <h4 className="post-card-title-sm post-title-hover">
            {post.title}
          </h4>
          <span className="ui-label block mt-1">
            <TimeAgo timestamp={post.created_at} />
          </span>
        </Link>
      </article>
    );
  }

  /* ─── Horizontal: related posts / search ─── */
  if (variant === 'horizontal') {
    return (
      <article className="group pb-4 mb-4">
        <Link href={`/p/${post.slug}`} className="flex gap-4 pt-2">
          {post.cover_image && (
            <div className="flex-shrink-0 w-[72px] h-[72px] overflow-hidden bg-[var(--bg-surface)] relative">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                sizes="72px"
                style={{ objectFit: 'cover' }}
                unoptimized={isLocalImage(post.cover_image)}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="post-card-title-md post-title-hover">
              {post.title}
            </h4>
            <p className="post-excerpt-sm mt-[0.3rem] line-clamp-2">
              <TextUtils html={post.excerpt} maxLength={80} />
            </p>
            <span className="ui-label block mt-[0.35rem]">
              <TimeAgo timestamp={post.created_at} />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  /* ─── Profile variant: simple stacked ─── */
  if (variant === 'profile') {
    return (
      <article className="border-b border-[var(--border)] mb-5 last:border-0 last:mb-0 group">
        {post.cover_image && (
          <Link href={`/p/${post.slug}`} className="block overflow-hidden">
            <div className="cover-image-wrap">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                style={{ objectFit: 'cover', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                className="group-hover:scale-[1.02]"
                unoptimized={isLocalImage(post.cover_image)}
              />
            </div>
          </Link>
        )}
        <div className="pt-4 pb-5">
          {post.categories?.length > 0 && (
            <div className="mb-2">
              {post.categories.map((cat, i) => (
                <React.Fragment key={cat.id || cat.name}>
                  {i > 0 && <span className="ui-label mx-[0.25rem]">,</span>}
                  <Link href={`/category/${cat.name.toLowerCase()}`} className="category-overline">{cat.name}</Link>
                </React.Fragment>
              ))}
            </div>
          )}
          <Link href={`/p/${post.slug}`} className="block">
            <h2 className="post-card-title post-title-hover">{post.title}</h2>
          </Link>
          <div className="flex items-center gap-5 mb-4">
            <span className="flex items-center gap-[0.35rem] ui-label">
              <Clock weight="regular" style={{ width: 13, height: 13 }} />
              <TimeAgo timestamp={post.created_at} />
            </span>
          </div>
          {post.excerpt && (
            <div className="post-excerpt-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.excerpt) }} />
          )}
          <Link href={`/p/${post.slug}`} className="continue-reading">{t('post.continueReading')}</Link>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-[0.4rem] mt-3">
              {post.tags.map((tag) => (
                <Link key={tag.id || tag.name} href={`/tag/${tag.name}`} className="tag-chip">◆ {tag.name}</Link>
              ))}
            </div>
          )}
          {isPostOwner && (
            <div className="flex gap-2 mt-4">
              <Link href={`/edit/${post.slug}`} className="action-btn hover:text-[var(--text)] hover:border-[var(--border-mid)]">
                <PencilSimple style={{ width: 10, height: 10 }} />{t('common.edit')}
              </Link>
              <button onClick={handleDelete} className="action-btn hover:text-[#DC2626] hover:border-[#DC2626]/30">
                <Trash style={{ width: 10, height: 10 }} />{t('common.delete')}
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }

  /* ─── Default variant: layered card (image 1/3 top + floating content panel) ─── */
  return (
    <article className="group bg-[var(--bg)]">

      {/* ── Layer 1: image strip (top ~1/3 of card) ── */}
      {post.cover_image ? (
        <Link href={`/p/${post.slug}`} className="block">
          <div className="post-card-img">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 680px"
              style={{ objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              className="group-hover:scale-[1.03]"
              unoptimized={isLocalImage(post.cover_image)}
            />
          </div>
        </Link>
      ) : (
        /* No image — thin accent bar so panel still has something to overlap */
        <div style={{ height: '0.5rem', background: 'var(--accent)', opacity: 0.15 }} />
      )}

      {/* ── Layer 2: floating content panel (overlaps image) ── */}
      <div className="post-card-panel">

        {/* Categories */}
        {post.categories?.length > 0 && (
          <div className="mb-2">
            {post.categories.map((cat, i) => (
              <React.Fragment key={cat.id || cat.name}>
                {i > 0 && <span className="ui-label mx-[0.25rem]">,</span>}
                <Link href={`/category/${cat.name.toLowerCase()}`} className="category-overline">
                  {cat.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/p/${post.slug}`} className="block">
          <h2 className="post-card-title post-title-hover">{post.title}</h2>
        </Link>

        {/* Meta row */}
        <div className="flex items-center gap-5 mb-6">
          <span className="flex items-center gap-[0.35rem] ui-label">
            <Clock weight="regular" style={{ width: 13, height: 13 }} />
            <TimeAgo timestamp={post.created_at} />
          </span>
          <Link
            href={`/p/${post.slug}#comments`}
            className="flex items-center gap-[0.35rem] ui-label-caps hover:text-[var(--accent)]"
          >
            <ChatCircle weight="regular" style={{ width: 13, height: 13 }} />
            {t('post.leaveComment')}
          </Link>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <div
            className="post-excerpt-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.excerpt) }}
          />
        )}

        {/* Continue reading */}
        <Link href={`/p/${post.slug}`} className="continue-reading">
          {t('post.continueReading')}
        </Link>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-[0.4rem] mt-3">
            {post.tags.map((tag) => (
              <Link key={tag.id || tag.name} href={`/tag/${tag.name}`} className="tag-chip">
                ◆ {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Owner actions */}
        {isPostOwner && (
          <div className="flex gap-2 mt-4">
            <Link href={`/edit/${post.slug}`} className="action-btn hover:text-[var(--text)] hover:border-[var(--border-mid)]">
              <PencilSimple style={{ width: 10, height: 10 }} />{t('common.edit')}
            </Link>
            <button onClick={handleDelete} className="action-btn hover:text-[#DC2626] hover:border-[#DC2626]/30">
              <Trash style={{ width: 10, height: 10 }} />{t('common.delete')}
            </button>
          </div>
        )}
      </div>

    </article>
  );
};

export default BasePostItem;
