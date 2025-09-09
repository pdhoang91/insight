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
import { themeClasses, componentClasses } from '../../utils/themeClasses';

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
    <article className={componentClasses.card.hover}>
      <div className={`${themeClasses.responsive.flexDesktopRow} ${themeClasses.spacing.gap} items-start`}>
        {/* Main Content Section */}
        <div className="flex-1 min-w-0">
          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className={`block ${themeClasses.spacing.marginBottom}`}>
            <h2 className={`${componentClasses.heading.h3} ${themeClasses.interactive.link} line-clamp-2 text-balance`}>
              {post.title}
            </h2>
          </Link>

          {/* Post Preview Content */}
          <div className={themeClasses.spacing.marginBottom}>
            <p className="text-body text-medium-text-secondary line-clamp-3 leading-relaxed">
              <TextUtils html={post.preview_content} maxLength={280} />
            </p>
          </div>

          {/* Meta Information & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side - Meta info */}
            <div className="flex items-center gap-4 text-body-small">
              <TimeAgo timestamp={post.created_at} className="text-medium-text-muted" />
              <span className="w-1 h-1 bg-medium-text-muted rounded-full"></span>
              <span className="text-medium-text-muted">
                {Math.ceil((post.preview_content?.length || 0) / 200)} min read
              </span>
            </div>

            {/* Right side - Interaction buttons */}
            <div className="flex items-center gap-6">
              {/* Clap Button */}
              <button
                onClick={handleClap}
                disabled={clapsLoading}
                className={`${themeClasses.interactive.touchTarget} gap-sm text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 group`}
                aria-label={`Clap for this post. Current claps: ${clapsCount}`}
                role="button"
                tabIndex={0}
              >
                <FaHandsClapping className={`${themeClasses.icons.buttonSm} group-hover:scale-110`} />
                <span className="font-medium text-body-small">{clapsCount}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={toggleCommentPopup}
                className={`${themeClasses.interactive.touchTarget} gap-sm text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 group`}
                aria-label={`View comments. ${totalCount || 0} comments`}
                role="button"
                tabIndex={0}
              >
                <FaComment className={`${themeClasses.icons.buttonSm} group-hover:scale-110`} />
                <span className="font-medium text-body-small">{totalCount || 0}</span>
              </button>

              {/* View Count */}
              <div className="flex items-center gap-sm text-medium-text-muted">
                <FaEye className={themeClasses.icons.sm} />
                <span className="font-medium text-body-small">{post.views || 0}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Image Section */}
        {post.image_title && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <Link href={`/p/${post.title_name}`} className="block">
              <div className="relative overflow-hidden rounded-lg bg-medium-bg-secondary">
                <img
                  src={post.image_title}
                  alt={post.title}
                  className="w-full h-48 lg:h-40 object-cover transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Comments Section - Full Width */}
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
    </article>
  );
};

export default PostItem;
