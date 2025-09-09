// components/Post/PostItem.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from "react-icons/fa6";
import { AddCommentForm, LimitedCommentList } from '../Comment';
import Rating from './Rating';
import TextUtils from '../Utils/TextUtils';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import TimeAgo from '../Utils/TimeAgo';

const PostItem = ({ post }) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }

  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { theme } = useTheme();
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const { comments, totalCount, isLoading, isError, mutate, canLoadMore, loadMore } = useInfiniteComments(post.id, isCommentsOpen, 3);


  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }
    try {
      //mutateClaps((current) => current + 1, false);
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      mutateClaps();
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };


  return (
    <article
      className="rounded-card px-6 py-8 mb-8 bg-medium-bg-card border border-medium-border transition-all duration-200 hover:shadow-card-hover hover:border-medium-accent-green/20"
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Main Content Section */}
        <div className="flex-1 min-w-0">
          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className="block mb-4">
            <h2 className="text-heading-3 font-serif text-medium-text-primary hover:text-medium-accent-green transition-colors duration-200 line-clamp-2 leading-tight">
              {post.title}
            </h2>
          </Link>

          {/* Post Preview Content */}
          <div className="mb-6">
            <p className="text-body text-medium-text-secondary line-clamp-3 leading-relaxed">
              <TextUtils html={post.preview_content} maxLength={280} />
            </p>
          </div>

          {/* Meta Information & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side - Meta info */}
            <div className="flex items-center space-x-4 text-sm">
              <TimeAgo timestamp={post.created_at} className="text-medium-text-muted" />
              <span className="w-1 h-1 bg-medium-text-muted rounded-full"></span>
              <span className="text-medium-text-muted">
                {Math.ceil((post.preview_content?.length || 0) / 200)} min read
              </span>
            </div>

            {/* Right side - Interaction buttons */}
            <div className="flex items-center space-x-6">
              {/* Clap Button */}
              <button
                onClick={handleClap}
                disabled={clapsLoading}
                className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-accent-green transition-colors group"
                aria-label="Clap for this post"
              >
                <FaHandsClapping className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{clapsCount}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-accent-green transition-colors group"
                aria-label="View comments"
              >
                <FaComment className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{totalCount || 0}</span>
              </button>

              {/* View Count */}
              <div className="flex items-center space-x-2 text-medium-text-muted">
                <FaEye className="w-4 h-4" />
                <span className="font-medium">{post.views || 0}</span>
              </div>
            </div>
          </div>

          {/* Inline Comments Section */}
          {isCommentsOpen && (
            <div className="mt-8 pt-6 border-t border-medium-border">
              <div className="space-y-6">
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
            </div>
          )}
        </div>

        {/* Image Section */}
        {post.image_title && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <Link href={`/p/${post.title_name}`} className="block">
              <div className="relative overflow-hidden rounded-medium bg-medium-bg-secondary">
                <img
                  src={post.image_title}
                  alt={post.title}
                  className="w-full h-48 lg:h-40 object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostItem;
