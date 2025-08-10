// components/Post/PostItem.js
import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import CommentsPopup from '../Comment/CommentsPopup';
import TimeAgo from '../Utils/TimeAgo';
import TextUtils from '../Utils/TextUtils';
import SafeImage from '../Utils/SafeImage';

const PostItem = ({ post, variant = 'default' }) => {
  if (!post) {
    return <div>Loading post...</div>;
  }

  const { user } = useUser();
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const { comments, totalCount, isLoading, isError, mutate } = useComments(post.id);

  const handleClap = async () => {
    if (!user) {
      alert('You need to login to clap.');
      return;
    }

    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Clap error:', error);
      alert('An error occurred while clapping. Please try again.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  // Compact variant for smaller spaces
  if (variant === 'compact') {
    return (
      <>
        <article className="bg-surface rounded-lg border border-border-primary p-4 hover:shadow-md transition-all duration-200">
          <div className="flex gap-4">
            {/* Left Side - Content */}
            <div className="flex-1 min-w-0">
              {/* Author Info - Smaller */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-medium">
                    {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-secondary min-w-0">
                  <span className="font-medium text-primary truncate">
                    {post.user?.name || 'Anonymous'}
                  </span>
                  <span className="text-muted">•</span>
                  <TimeAgo timestamp={post.created_at} />
                </div>
              </div>

              {/* Title - Smaller */}
              <Link href={`/p/${post.title_name}`}>
                <h3 className="text-base font-semibold text-primary mb-2 hover:text-primary-hover transition-colors leading-tight line-clamp-2">
                  {post.title}
                </h3>
              </Link>

              {/* Content Preview - Shorter */}
              <div className="text-secondary text-sm mb-3 leading-relaxed">
                <TextUtils html={post.preview_content} maxLength={80} />
              </div>

              {/* Actions - Compact */}
              <div className="flex items-center gap-3">
                {/* Views */}
                <div className="flex items-center gap-1 text-muted">
                  <FaEye className="w-3 h-3" />
                  <span className="text-xs">{post.views || 0}</span>
                </div>

                <button
                  onClick={handleClap}
                  disabled={clapLoading}
                  className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
                >
                  <FaHandsClapping className="w-3 h-3" />
                  <span className="text-xs">{currentClapCount}</span>
                </button>

                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
                >
                  <FaComment className="w-3 h-3" />
                  <span className="text-xs">{post.comments_count || 0}</span>
                </button>
              </div>
            </div>

            {/* Right Side - Image - Smaller */}
            {post.image_title && (
              <div className="w-20 h-20 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-md hover:opacity-90 transition-opacity"
                    sizes="80px"
                  />
                </Link>
              </div>
            )}
          </div>
        </article>

        {/* Comments Popup */}
        {isCommentsOpen && (
          <CommentsPopup
            postId={post.id}
            comments={comments}
            totalCount={totalCount}
            isLoading={isLoading}
            isError={isError}
            mutate={mutate}
            onClose={closeCommentPopup}
          />
        )}
      </>
    );
  }

  // Default variant - Modern Medium-style layout
  return (
    <>
      <article className="bg-surface border-b border-border-primary py-4 md:py-6 hover:bg-elevated/50 transition-colors duration-200">
        <div className="flex gap-4 md:gap-6">
          {/* Left Side - Content */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-medium">
                  {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-secondary min-w-0">
                <span className="font-medium text-primary truncate">
                  {post.user?.name || 'Anonymous'}
                </span>
                <span className="text-muted hidden sm:inline">in</span>
                {post.categories && post.categories.length > 0 && (
                  <Link
                    href={`/category/${(post.categories[0].name || post.categories[0]).toLowerCase()}`}
                    className="text-secondary hover:text-primary font-medium truncate hidden sm:inline"
                  >
                    {post.categories[0].name || post.categories[0]}
                  </Link>
                )}
              </div>
            </div>

            {/* Title */}
            <Link href={`/p/${post.title_name}`}>
              <h2 className="text-lg md:text-xl font-bold text-primary mb-2 hover:text-primary-hover transition-colors leading-tight line-clamp-2">
                {post.title}
              </h2>
            </Link>

            {/* Content Preview */}
            <div className="text-secondary text-sm md:text-base mb-3 md:mb-4 leading-relaxed">
              <TextUtils html={post.preview_content} maxLength={120} />
            </div>

            {/* Meta Info & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted">
                <TimeAgo timestamp={post.created_at} />
                <span>•</span>
                <span className="hidden sm:inline">5 min read</span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-3 md:gap-4">
                {/* Views */}
                <div className="flex items-center gap-1 text-muted">
                  <FaEye className="w-4 h-4" />
                  <span className="text-sm">{post.views || 0}</span>
                </div>

                {/* Clap */}
                <button
                  onClick={handleClap}
                  disabled={clapLoading}
                  className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
                >
                  <FaHandsClapping className="w-4 h-4" />
                  <span className="text-sm">{currentClapCount}</span>
                </button>

                {/* Comment */}
                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
                >
                  <FaComment className="w-4 h-4" />
                  <span className="text-sm">{post.comments_count || 0}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          {post.image_title && (
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
              <Link href={`/p/${post.title_name}`}>
                <SafeImage
                  src={post.image_title}
                  alt={post.title}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                  sizes="(max-width: 768px) 96px, 128px"
                />
              </Link>
            </div>
          )}
        </div>
      </article>

      {/* Comments Popup */}
      {isCommentsOpen && (
        <CommentsPopup
          postId={post.id}
          comments={comments}
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          mutate={mutate}
          onClose={closeCommentPopup}
        />
      )}
    </>
  );
};

export default PostItem;
