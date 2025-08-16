// components/Post/PostItemTimeline.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaComment, FaEye, FaClock } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import AddCommentForm from '../Comment/AddCommentForm';
import CommentItem from '../Comment/CommentItem';
import { addComment } from '../../services/commentService';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

const PostItemTimeline = ({ post }) => {
  if (!post) {
    return (
      <div className="bg-terminal-gray rounded-lg border border-matrix-green/30 p-4 sm:p-6 animate-pulse">
        <div className="text-text-muted font-mono">Đang tải bài viết...</div>
      </div>
    );
  }

  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);
  
  // Get comments data with infinite loading
  const { 
    comments, 
    totalCount, 
    isLoading, 
    isError, 
    canLoadMore,
    loadMore,
    mutate 
  } = useInfiniteComments(post.id, isCommentsOpen, 2);

  // Removed TechIcon to improve performance

  const handleClap = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để vỗ tay.');
      return;
    }
    if (clapLoading) return;
    
    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Không thể vỗ tay. Vui lòng thử lại.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => setCommentsOpen((prev) => !prev);

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận.');
      return;
    }
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      await addComment(post.id, content);
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Không thể thêm bình luận. Vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full">
      <article className="mb-4 sm:mb-6 pb-4 sm:pb-6">
        <div className="py-4 sm:py-6 border-b border-border-primary/20">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 flex flex-col order-2 sm:order-1">
              <div className="flex-1">
                {/* Title */}
                <Link href={`/p/${post.title_name}`}>
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-text-primary hover:text-matrix-green transition-colors duration-300 line-clamp-2 mb-2 sm:mb-3">
                    {post.title}
                  </h2>
                </Link>

                {/* Content Preview */}
                <div className="text-text-secondary text-sm sm:text-base line-clamp-3 sm:line-clamp-4 lg:line-clamp-6 mb-3 sm:mb-4 leading-relaxed">
                  <TextUtils html={post.preview_content} maxLength={6000} />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {post.categories && post.categories.slice(0, 2).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${(category.name || category).toLowerCase()}`}
                      className="px-2 sm:px-3 py-1 bg-matrix-green/10 text-matrix-green rounded-full text-xs font-medium hover:bg-matrix-green/20 transition-colors"
                    >
                      {category.name || category}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Claps */}
                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center gap-1.5 sm:gap-2 text-text-muted hover:text-hacker-yellow transition-colors"
                  >
                    <FaHandsClapping className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${clapLoading ? 'animate-pulse' : ''}`} />
                    <span className="text-xs sm:text-sm">{currentClapCount}</span>
                  </button>

                  {/* Comments */}
                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center gap-1.5 sm:gap-2 text-text-muted hover:text-matrix-green transition-colors"
                  >
                    <FaComment className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{post.comments_count || 0}</span>
                  </button>

                  {/* Views */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted">
                    <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{post.views || 0}</span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-3 h-3 flex-shrink-0" />
                    <TimeAgo timestamp={post.created_at} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            {post.image_title && (
              <div className="w-full sm:w-1/3 order-1 sm:order-2 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative w-full h-40 sm:h-32 md:h-40 lg:h-48">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
                    />
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {isCommentsOpen && (
          <div className="mt-3 sm:mt-4">
            {/* Add Comment Form */}
            <div className="py-4 sm:py-6 px-4 sm:px-6">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <div className="text-center py-3 sm:py-4">
                  <span className="text-text-muted text-sm">Vui lòng đăng nhập để bình luận</span>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="py-4 sm:py-6 px-4 sm:px-6">
              {isError && (
                <div className="text-hacker-red text-sm text-center py-3 sm:py-4">
                  Failed to load comments
                </div>
              )}
              
              {isLoading && comments.length === 0 && (
                <div className="flex justify-center items-center py-4 sm:py-6">
                  <div className="w-4 h-4 border-2 border-matrix-green border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-text-secondary text-sm">Loading comments...</span>
                </div>
              )}

              {comments && comments.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                  ))}
                  
                  {canLoadMore && (
                    <div className="text-center pt-3 sm:pt-4">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="px-3 sm:px-4 py-2 text-sm text-matrix-green hover:text-matrix-light-green border border-matrix-green/30 rounded hover:border-matrix-green/50 transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Loading...' : `Load more (${totalCount - comments.length} remaining)`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !isError && comments.length === 0 && (
                <div className="text-center py-4 sm:py-6">
                  <span className="text-text-muted text-sm">No comments yet</span>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostItemTimeline; 