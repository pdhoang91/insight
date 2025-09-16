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
    <article className={`group relative ${themeClasses.bg.card} ${themeClasses.effects.rounded} ${themeClasses.spacing.marginBottom} ${themeClasses.animations.smooth}`}>
      <div className={`${themeClasses.layout.flexRow} ${themeClasses.spacing.gap} items-start`}>
        {/* Image Section - First on mobile, second on desktop */}
        {post.image_title && (
          <div className="w-full md:w-64 lg:w-80 flex-shrink-0 order-1 md:order-2">
            <Link href={`/p/${post.title_name}`} className="block">
              <div className={`relative overflow-hidden ${themeClasses.effects.rounded} ${themeClasses.bg.secondary}`}>
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
        <div className="flex-1 min-w-0 order-2 md:order-1">
          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className={`block ${themeClasses.spacing.marginBottom}`}>
            <h2 className={`${themeClasses.typography.h2} ${themeClasses.text.primary} mb-3 line-clamp-2 text-balance ${themeClasses.text.accentHover} ${themeClasses.animations.smooth}`}>
              {post.title}
            </h2>
          </Link>

          {/* Post Preview Content */}
          <div className={themeClasses.spacing.marginBottom}>
            <p className={`${themeClasses.text.bodyLarge} ${themeClasses.text.secondary} line-clamp-3 leading-relaxed`}>
              <TextUtils html={post.preview_content} maxLength={280} />
            </p>
          </div>

          {/* Meta Information & Actions - All hidden by default, show on hover */}
          <div className={`${themeClasses.responsive.flexTabletRow} items-center justify-between ${themeClasses.spacing.gapSmall} opacity-0 group-hover:opacity-100 ${themeClasses.animations.smooth}`}>
            {/* Left side - Meta info */}
            <div className={`flex items-center ${themeClasses.spacing.gapSmall} ${themeClasses.text.bodySmall}`}>
              <TimeAgo timestamp={post.created_at} className={themeClasses.text.muted} />
              <span className={`w-1 h-1 ${themeClasses.bg.primary} rounded-full`}></span>
              <span className={themeClasses.text.muted}>
                {Math.ceil((post.preview_content?.length || 0) / 200)} min read
              </span>
            </div>

            {/* Right side - Interaction buttons */}
            <div className={`flex items-center ${themeClasses.spacing.gap}`}>
              {/* Clap Button */}
              <button
                onClick={handleClap}
                disabled={clapsLoading}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${themeClasses.text.secondary} ${themeClasses.text.accentHover} hover:bg-medium-hover ${themeClasses.animations.smooth} ${themeClasses.interactive.touchTarget}`}
                aria-label={`Clap for this post. Current claps: ${clapsCount}`}
              >
                <FaHandsClapping className={themeClasses.icons.sm} />
                <span className={`${themeClasses.typography.weightMedium} ${themeClasses.typography.bodySmall}`}>{clapsCount}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={toggleCommentPopup}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${themeClasses.text.secondary} ${themeClasses.text.accentHover} hover:bg-medium-hover ${themeClasses.animations.smooth} ${themeClasses.interactive.touchTarget}`}
                aria-label={`View comments. ${totalCount || 0} comments`}
              >
                <FaComment className={themeClasses.icons.sm} />
                <span className={`${themeClasses.typography.weightMedium} ${themeClasses.typography.bodySmall}`}>{totalCount || 0}</span>
              </button>

              {/* View Count */}
              <div className={`flex items-center gap-2 ${themeClasses.text.muted}`}>
                <FaEye className={themeClasses.icons.sm} />
                <span className={`${themeClasses.typography.weightMedium} ${themeClasses.typography.bodySmall}`}>{post.views || 0}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Comments Section - Full Width */}
      {isCommentsOpen && (
        <div className={`mt-8 pt-6`}>
          <div className={themeClasses.spacing.stack}>
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
