// components/Post/BasePostItem.js — Single source of truth for post cards
import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useRouter } from 'next/router';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import { AddCommentForm, LimitedCommentList } from '../Comment';
import { useClapsCount } from '../../hooks/useClapsCount';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { deletePost } from '../../services/postService';

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
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await deletePost(post.id);
      router.reload();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  // --- Compact variant (sidebar / popular posts) ---
  if (variant === 'compact') {
    return (
      <article className="py-3 border-b border-medium-border last:border-0">
        <Link href={`/p/${post.slug}`} className="block group">
          <h4 className="font-serif font-semibold text-sm text-medium-text-primary group-hover:text-medium-accent-green transition-colors line-clamp-2">
            {post.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-medium-text-muted">
            <TimeAgo timestamp={post.created_at} />
          </div>
        </Link>
      </article>
    );
  }

  // --- Horizontal variant (related posts, search results) ---
  if (variant === 'horizontal') {
    return (
      <article className="group">
        <Link href={`/p/${post.slug}`} className="flex gap-4 p-3 rounded-lg">
          {post.cover_image && (
            <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-medium-bg-secondary">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-semibold text-sm text-medium-text-primary group-hover:text-medium-accent-green transition-colors line-clamp-2 mb-1">
              {post.title}
            </h4>
            <p className="text-xs text-medium-text-secondary line-clamp-1">
              <TextUtils html={post.excerpt} maxLength={80} />
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-medium-text-muted">
              <TimeAgo timestamp={post.created_at} />
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // --- Shared meta + actions for default & profile ---
  const metaRow = (
    <div className="flex items-center gap-3 text-xs text-medium-text-muted mt-3">
      <TimeAgo timestamp={post.created_at} />
      <span className="w-1 h-1 bg-medium-text-muted rounded-full" />
      <span>{Math.ceil((post.excerpt?.length || 0) / 200)} min read</span>
    </div>
  );

  const actionsRow = (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleClap}
          disabled={clapsLoading}
          className="flex items-center gap-1.5 text-sm text-medium-text-secondary hover:text-medium-accent-green transition-colors"
        >
          <FaHandsClapping className="w-4 h-4" />
          <span>{clapsCount || 0}</span>
        </button>
        {showComments && (
          <button
            onClick={() => setCommentsOpen(prev => !prev)}
            className="flex items-center gap-1.5 text-sm text-medium-text-secondary hover:text-medium-accent-green transition-colors"
          >
            <FaComment className="w-4 h-4" />
            <span>{totalCount || 0}</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 text-sm text-medium-text-muted">
          <FaEye className="w-4 h-4" />
          <span>{post.view_count || post.views || 0}</span>
        </div>
      </div>

      {isOwner && (
        <div className="flex items-center gap-2">
          <Link
            href={`/edit/${post.id}`}
            className="p-1.5 rounded text-medium-text-secondary hover:text-medium-accent-green transition-colors"
          >
            <FaEdit className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded text-medium-text-secondary hover:text-red-500 transition-colors"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  const commentsSection = showComments && isCommentsOpen && (
    <div className="mt-6 pt-6 border-t border-medium-border">
      <AddCommentForm
        postId={post.id}
        user={user}
        onCommentAdded={mutate}
      />
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
  );

  // --- Profile variant (with owner actions, same layout as default) ---
  if (variant === 'profile') {
    return (
      <article className="bg-white rounded-lg border border-medium-border p-5 mb-4">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <Link href={`/p/${post.slug}`}>
              <h2 className="font-serif text-xl font-bold text-medium-text-primary hover:text-medium-accent-green transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-medium-text-secondary text-sm line-clamp-2 mt-2 leading-relaxed">
              <TextUtils html={post.excerpt} maxLength={200} />
            </p>
            {post.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.categories.slice(0, 3).map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.name}`}
                    className="px-2.5 py-0.5 bg-medium-bg-secondary text-medium-text-secondary text-xs rounded-full hover:text-medium-accent-green transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
            {metaRow}
            {actionsRow}
          </div>
          {post.cover_image && (
            <div className="w-full lg:w-56 flex-shrink-0">
              <Link href={`/p/${post.slug}`}>
                <div className="aspect-[16/10] rounded-md overflow-hidden bg-medium-bg-secondary">
                  <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </Link>
            </div>
          )}
        </div>
        {commentsSection}
      </article>
    );
  }

  // --- Default variant (homepage card) ---
  return (
    <article className="bg-white border-b border-medium-border pb-6 mb-6 last:border-0">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <Link href={`/p/${post.slug}`}>
            <h2 className="font-serif text-xl lg:text-2xl font-bold text-medium-text-primary hover:text-medium-accent-green transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-medium-text-secondary text-sm lg:text-base line-clamp-2 mt-2 leading-relaxed">
            <TextUtils html={post.excerpt} maxLength={200} />
          </p>
          {post.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.categories.slice(0, 3).map(cat => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.name}`}
                    className="px-2.5 py-0.5 bg-medium-bg-secondary text-medium-text-secondary text-xs rounded-full hover:text-medium-accent-green transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          {metaRow}
          {actionsRow}
        </div>
        {post.cover_image && (
          <div className="w-full lg:w-64 flex-shrink-0 order-first lg:order-last">
            <Link href={`/p/${post.slug}`}>
              <div className="aspect-[16/10] rounded-md overflow-hidden bg-medium-bg-secondary">
                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </Link>
          </div>
        )}
      </div>
      {commentsSection}
    </article>
  );
};

export default BasePostItem;
