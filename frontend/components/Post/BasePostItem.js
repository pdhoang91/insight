'use client';
// components/Post/BasePostItem.js — Single source of truth for post cards
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEdit, FaTrash, FaComment, FaEllipsisH } from 'react-icons/fa';
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
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      router.refresh();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  // --- Compact variant (sidebar / popular posts) ---
  if (variant === 'compact') {
    return (
      <article className="py-3 border-b border-[#f2f2f2] last:border-0">
        <Link href={`/p/${post.slug}`} className="block group">
          <h4 className="font-serif font-semibold text-sm text-[#292929] group-hover:underline line-clamp-2">
            {post.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[12px] text-[#b3b3b1]">
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
        <Link href={`/p/${post.slug}`} className="flex gap-4 py-3">
          {post.cover_image && (
            <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-[#f2f2f2]">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-semibold text-sm text-[#292929] group-hover:underline line-clamp-2 mb-1">
              {post.title}
            </h4>
            <p className="text-[12px] text-[#757575] line-clamp-1">
              <TextUtils html={post.excerpt} maxLength={80} />
            </p>
            <div className="flex items-center gap-2 mt-1 text-[12px] text-[#b3b3b1]">
              <TimeAgo timestamp={post.created_at} />
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // --- Shared elements for default & profile ---
  const metaRow = (
    <div className="flex items-center gap-2 text-[13px] text-[#757575] mt-2">
      <TimeAgo timestamp={post.created_at} />
      <span className="text-[#c2c2c2]">·</span>
      <span>{Math.ceil((post.excerpt?.length || 0) / 200)} min read</span>
    </div>
  );

  const actionsRow = (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handleClap}
          disabled={clapsLoading}
          className="flex items-center gap-1.5 text-[13px] text-[#6b6b6b] hover:text-[#292929] transition-colors"
        >
          <FaHandsClapping className="w-4 h-4" />
          {clapsCount > 0 && <span>{clapsCount}</span>}
        </button>
        {showComments && (
          <button
            onClick={() => setCommentsOpen(prev => !prev)}
            className="flex items-center gap-1.5 text-[13px] text-[#6b6b6b] hover:text-[#292929] transition-colors"
          >
            <FaComment className="w-3.5 h-3.5" />
            {totalCount > 0 && <span>{totalCount}</span>}
          </button>
        )}
      </div>

      {(isOwner || (user && post.user?.id === user.id)) && <OwnerMenu postSlug={post.slug} onDelete={handleDelete} />}
    </div>
  );

  const commentsSection = showComments && isCommentsOpen && (
    <div className="mt-6 pt-6 border-t border-[#f2f2f2]">
      <AddCommentForm postId={post.id} user={user} onCommentAdded={mutate} />
      <div className="mt-4">
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

  const categoriesRow = post.categories?.length > 0 && (
    <div className="flex flex-wrap items-center gap-1 mt-2 text-[13px] text-[#757575]">
      {post.categories.slice(0, 3).map((cat, i) => (
        <span key={cat.id}>
          {i > 0 && <span className="text-[#c2c2c2] mx-1">·</span>}
          <Link href={`/category/${cat.name}`} className="hover:text-[#292929] transition-colors">
            {cat.name}
          </Link>
        </span>
      ))}
    </div>
  );

  // --- Profile variant ---
  if (variant === 'profile') {
    return (
      <article className="border-b border-[#f2f2f2] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <Link href={`/p/${post.slug}`}>
              <h2 className="font-serif text-lg font-bold text-[#292929] hover:underline line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-[14px] text-[#757575] line-clamp-2 mt-1.5 leading-relaxed">
              <TextUtils html={post.excerpt} maxLength={200} />
            </p>
            {categoriesRow}
            {metaRow}
            {actionsRow}
          </div>
          {post.cover_image && (
            <div className="w-full lg:w-48 flex-shrink-0">
              <Link href={`/p/${post.slug}`}>
                <div className="aspect-[16/10] overflow-hidden bg-[#f2f2f2]">
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

  // --- Default variant (homepage) ---
  return (
    <article className="border-b border-[#f2f2f2] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <Link href={`/p/${post.slug}`}>
            <h2 className="font-serif text-xl font-bold text-[#292929] hover:underline line-clamp-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-[14px] text-[#757575] line-clamp-2 mt-1.5 leading-relaxed">
            <TextUtils html={post.excerpt} maxLength={200} />
          </p>
          {categoriesRow}
          {metaRow}
          {actionsRow}
        </div>
        {post.cover_image && (
          <div className="w-full lg:w-56 flex-shrink-0 order-first lg:order-last">
            <Link href={`/p/${post.slug}`}>
              <div className="aspect-[16/10] overflow-hidden bg-[#f2f2f2]">
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="p-1.5 text-[#6b6b6b] hover:text-[#292929] transition-colors"
      >
        <FaEllipsisH className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#e6e6e6] rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
          <Link
            href={`/edit/${postSlug}`}
            className="flex items-center gap-2 px-4 py-2 text-[13px] text-[#292929] hover:bg-[#fafafa] transition-colors w-full"
          >
            <FaEdit className="w-3.5 h-3.5 text-[#757575]" />
            Edit
          </Link>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="flex items-center gap-2 px-4 py-2 text-[13px] text-red-500 hover:bg-[#fafafa] transition-colors w-full text-left"
          >
            <FaTrash className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default BasePostItem;
