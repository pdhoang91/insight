import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaComment, FaHandsClapping, FaTag } from 'react-icons/fa';
import { FaHandsClapping as FaHandsClappingRegular } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import SafeImage from '../Utils/SafeImage';
import TimeAgo from '../Utils/TimeAgo';
import TextUtils from '../Utils/TextUtils';
import AddCommentForm from '../Comment/AddCommentForm';
import CommentItem from '../Comment/CommentItem';
import { useComments } from '../../hooks/useComments';
import { clapPost } from '../../services/activityService';
import { addComment } from '../../services/commentService';

const PostItemCategories = ({ post }) => {
  const { user } = useUser();
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);
  const [clapLoading, setClapLoading] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Comments hook
  const { comments, totalCount, isLoading, isError, mutate } = useComments(
    post.id,
    isCommentsOpen,
    1,
    10
  );

  const handleClap = async () => {
    if (!user) {
      alert('You need to login to clap.');
      return;
    }

    if (clapLoading) return;

    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to clap post:', err);
      alert('Failed to clap post. Please try again.');
    } finally {
      setClapLoading(false);
    }
  };

  const handleAddComment = async (commentText) => {
    if (!user) {
      alert('You need to login to comment.');
      return;
    }

    if (!commentText.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      await addComment(post.id, commentText);
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const toggleCommentPopup = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  const closeCommentPopup = () => {
    setIsCommentsOpen(false);
  };

  return (
    <>
      <article className="hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div>
          {/* Header with author and meta info */}

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">
              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 line-clamp-2 mb-3 leading-tight">
                  {post.title}
                </h2>
              </Link>

              {/* Content Preview */}
              <div className="text-secondary text-sm sm:text-base line-clamp-3 sm:line-clamp-4 lg:line-clamp-5 mb-3 sm:mb-4 leading-relaxed">
                <TextUtils html={post.preview_content || post.content} maxLength={200} />
              </div>

              {/* Categories - Show current category and related ones */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {post.categories.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${(category.name || category).toLowerCase()}`}
                      className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20 inline-flex items-center gap-1"
                    >
                      <FaTag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{category.name || category}</span>
                    </Link>
                  ))}
                  {post.categories.length > 3 && (
                    <span className="px-2 sm:px-3 py-1 bg-muted/20 text-muted rounded-full text-xs">
                      +{post.categories.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Author and Meta Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary text-xs sm:text-sm font-bold">
                      {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                    <span className="font-medium text-primary">{post.user?.name || 'Anonymous'}</span>
                    <span className="hidden sm:inline">•</span>
                    <TimeAgo timestamp={post.created_at} />
                  </div>
                </div>
                
                {/* Reading time and difficulty (desktop only) */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-muted">
                  <span>{Math.ceil((post.content?.replace(/<[^>]*>/g, '').length || 0) / 200) || 1} min read</span>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            {post.image_title && (
              <div className="w-full lg:w-1/3 order-1 lg:order-2 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden rounded-lg">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-border-primary/20 mt-4 sm:mt-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Claps */}
              <button
                onClick={handleClap}
                disabled={clapLoading}
                className="flex items-center gap-1.5 sm:gap-2 text-muted hover:text-primary transition-colors"
              >
                <FaHandsClappingRegular className={`w-4 h-4 sm:w-5 sm:h-5 ${clapLoading ? 'animate-pulse' : ''}`} />
                <span className="text-sm sm:text-base font-medium">{currentClapCount}</span>
              </button>

              {/* Comments */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center gap-1.5 sm:gap-2 text-muted hover:text-primary transition-colors"
              >
                <FaComment className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">{post.comments_count || 0}</span>
              </button>

              {/* Views */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted">
                <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">{post.views || 0}</span>
              </div>
            </div>

            {/* Reading time (mobile only) */}
            <div className="sm:hidden flex items-center gap-2 text-xs text-muted">
              <span>{Math.ceil((post.content?.replace(/<[^>]*>/g, '').length || 0) / 200) || 1}m</span>
            </div>

            {/* Read More Link */}
            <Link
              href={`/p/${post.title_name}`}
              className="hidden sm:inline text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Read More →
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        {isCommentsOpen && (
          <div className="mt-4 sm:mt-6 border-t border-border-primary/20 pt-4 sm:pt-6">
            {/* Add Comment Form */}
            <div className="mb-4 sm:mb-6 py-2 px-0">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <div className="text-center py-3 sm:py-4">
                  <span className="text-muted text-sm">Please login to comment</span>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-3 sm:space-y-4 py-2 px-0">
              {isError && (
                <div className="text-danger text-sm text-center py-3 sm:py-4">
                  Failed to load comments
                </div>
              )}
              
              {isLoading && comments.length === 0 && (
                <div className="flex justify-center items-center py-4 sm:py-6">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-secondary text-sm">Loading comments...</span>
                </div>
              )}

              {comments && comments.length > 0 && (
                <>
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                  ))}
                </>
              )}

              {!isLoading && !isError && comments.length === 0 && (
                <div className="text-center py-4 sm:py-6">
                  <span className="text-muted text-sm">No comments yet</span>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default PostItemCategories; 