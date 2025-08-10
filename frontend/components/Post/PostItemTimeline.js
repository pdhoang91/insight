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
      <div className="bg-terminal-gray rounded-lg border border-matrix-green/30 p-6 animate-pulse">
        <div className="text-text-muted font-mono">Loading post...</div>
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
      alert('Please login to clap.');
      return;
    }
    if (clapLoading) return;
    
    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Failed to clap. Please try again.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => setCommentsOpen((prev) => !prev);

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Please login to comment.');
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
      alert('Failed to add comment. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <article className="bg-terminal-gray rounded-lg border border-matrix-green/30  transition-colors duration-300 mb-6">
        <div className="p-6">
          <div className="flex gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                {/* Title */}
                <Link href={`/p/${post.title_name}`}>
                  <h2 className="text-base md:text-lg font-bold text-text-primary hover:text-matrix-green transition-colors duration-300 line-clamp-2 mb-3">
                    {post.title}
                  </h2>
                </Link>

                {/* Content Preview */}
                <div className="text-text-secondary text-sm md:text-base line-clamp-27 mb-4 leading-relaxed">
                  <TextUtils html={post.preview_content} maxLength={800} />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories && post.categories.slice(0, 2).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${(category.name || category).toLowerCase()}`}
                      className="px-3 py-1 bg-matrix-green/10 text-matrix-green rounded-full text-xs font-medium hover:bg-matrix-green/20 transition-colors"
                    >
                      {category.name || category}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-6">
                  {/* Claps */}
                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center gap-2 text-text-muted hover:text-hacker-yellow transition-colors"
                  >
                    <FaHandsClapping className={`w-4 h-4 ${clapLoading ? 'animate-pulse' : ''}`} />
                    <span className="text-sm">{currentClapCount}</span>
                  </button>

                  {/* Comments */}
                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center gap-2 text-text-muted hover:text-matrix-green transition-colors"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm">{post.comments_count || 0}</span>
                  </button>

                  {/* Views */}
                  <div className="flex items-center gap-2 text-text-muted">
                    <FaEye className="w-4 h-4" />
                    <span className="text-sm">{post.views || 0}</span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-3 h-3 flex-shrink-0" />
                    <TimeAgo timestamp={post.created_at} />
                  </div>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            {post.image_title && (
              <div className="w-1/3">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative w-full h-32 md:h-40 lg:h-48">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover rounded border border-matrix-green/30 hover:border-matrix-green/50 transition-colors duration-300"
                      sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                    />
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {isCommentsOpen && (
          <div className="border-t border-matrix-green/30 bg-terminal-dark">
            {/* Add Comment Form */}
            <div className="p-6 border-b border-matrix-green/20">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <div className="text-center py-4">
                  <span className="text-text-muted text-sm">Please login to comment</span>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="p-6">
              {isError && (
                <div className="text-hacker-red text-sm text-center py-4">
                  Failed to load comments
                </div>
              )}
              
              {isLoading && comments.length === 0 && (
                <div className="flex justify-center items-center py-6">
                  <div className="w-4 h-4 border-2 border-matrix-green border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-text-secondary text-sm">Loading comments...</span>
                </div>
              )}

              {comments && comments.length > 0 && (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                  ))}
                  
                  {canLoadMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm text-matrix-green hover:text-matrix-light-green border border-matrix-green/30 rounded hover:border-matrix-green/50 transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Loading...' : `Load more (${totalCount - comments.length} remaining)`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !isError && comments.length === 0 && (
                <div className="text-center py-6">
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