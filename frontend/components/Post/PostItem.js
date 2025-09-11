// components/Post/PostItem.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from "react-icons/fa6";
import { AddCommentForm, LimitedCommentList } from '../Comment';
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
    <article className="group relative bg-medium-bg-card rounded-xl mb-8 transition-all duration-300">
      <div className={`${themeClasses.responsive.flexDesktopRow} ${themeClasses.spacing.gap} items-start`}>
        {/* Image Section - First on mobile, second on desktop */}
        {post.image_title && (
          <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2">
            <Link href={`/p/${post.title_name}`} className="block">
              <div className="relative overflow-hidden rounded-xl bg-medium-bg-secondary">
                <div className="aspect-[16/10]">
                  <img
                    src={post.image_title}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Main Content Section - Second on mobile, first on desktop */}
        <div className="flex-1 min-w-0 order-2 lg:order-1">
          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className={`block ${themeClasses.spacing.marginBottom}`}>
            <h2 className="text-xl lg:text-2xl font-bold text-medium-text-primary mb-3 line-clamp-2 text-balance group-hover:text-medium-accent-green transition-colors duration-300">
              {post.title}
            </h2>
          </Link>

          {/* Post Preview Content */}
          <div className="mb-6">
            <p className="text-medium-text-secondary line-clamp-3 leading-relaxed text-base lg:text-lg">
              <TextUtils html={post.preview_content} maxLength={280} />
            </p>
          </div>

          {/* Meta Information & Actions - All hidden by default, show on hover */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-medium-hover text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 min-h-[44px]"
                aria-label={`Clap for this post. Current claps: ${clapsCount}`}
              >
                <FaHandsClapping className="w-4 h-4" />
                <span className="font-medium text-sm">{clapsCount}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-medium-hover text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 min-h-[44px]"
                aria-label={`View comments. ${totalCount || 0} comments`}
              >
                <FaComment className="w-4 h-4" />
                <span className="font-medium text-sm">{totalCount || 0}</span>
              </button>

              {/* View Count */}
              <div className="flex items-center gap-2 text-medium-text-muted">
                <FaEye className="w-4 h-4" />
                <span className="font-medium text-sm">{post.views || 0}</span>
              </div>
            </div>
          </div>

        </div>
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
