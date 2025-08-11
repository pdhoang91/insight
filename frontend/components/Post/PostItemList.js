// components/Post/PostItemList.js
import React, { useState } from 'react';
import Link from 'next/link';
import { FaComment, FaEye } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import { addComment } from '../../services/commentService';
import AddCommentForm from '../Comment/AddCommentForm';
import CommentItem from '../Comment/CommentItem';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

const PostItemList = ({ post }) => {
  if (!post) {
    return <div>Loading post...</div>;
  }

  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);

  // Only load comments when the popup is actually open
  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, isCommentsOpen, 1, 10);

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
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('An error occurred while clapping. Please try again.');
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
    <>
      <article className="hover:shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row">
          {/* Left Side - Content */}
          <div className="flex-1 py-4 sm:py-6 px-4 sm:px-6 order-2 sm:order-1">
            {/* Compact Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-muted mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">
                    {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="font-medium">{post.user?.name || 'Anonymous'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="sm:hidden">
                  <TimeAgo timestamp={post.created_at} />
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:inline">
                  <TimeAgo timestamp={post.created_at} />
                </span>
                
                {/* Compact Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="hidden sm:inline">•</span>
                    {post.categories.slice(0, 2).map((category, index) => (
                      <Link
                        key={index}
                        href={`/category/${(category.name || category).toLowerCase()}`}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        {category.name || category}
                      </Link>
                    ))}
                    {post.categories.length > 2 && (
                      <span className="text-xs text-muted">+{post.categories.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <Link href={`/p/${post.title_name}`}>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary hover:text-primary-hover transition-colors line-clamp-2 mb-2 sm:mb-3 leading-tight">
                {post.title}
              </h3>
            </Link>

            {/* Content Preview */}
            <div className="text-secondary text-sm line-clamp-2 sm:line-clamp-3 lg:line-clamp-4 mb-3 sm:mb-4 leading-relaxed">
              <TextUtils html={post.preview_content} maxLength={180} />
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border-primary/20">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Claps */}
                <button
                  onClick={handleClap}
                  disabled={clapLoading}
                  className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                >
                  <FaHandsClapping className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${clapLoading ? 'animate-pulse' : ''}`} />
                  <span className="text-xs sm:text-sm font-medium">{currentClapCount}</span>
                </button>

                {/* Comments */}
                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                >
                  <FaComment className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{post.comments_count || 0}</span>
                </button>

                {/* Views */}
                <div className="flex items-center space-x-1 text-muted">
                  <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{post.views || 0}</span>
                </div>
              </div>

              {/* Reading Time */}
              <div className="text-xs text-muted">
                {Math.ceil((post.content?.replace(/<[^>]*>/g, '').length || 0) / 200) || 1} min read
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          {post.image_title && (
            <div className="w-full sm:w-1/3 lg:w-1/4 flex-shrink-0 order-1 sm:order-2">
              <Link href={`/p/${post.title_name}`}>
                <div className="relative w-full h-40 sm:h-full sm:min-h-[200px] lg:min-h-[240px]">
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300 rounded-t-lg sm:rounded-t-none sm:rounded-r-lg"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {isCommentsOpen && (
          <div className="border-t border-border-primary/20 bg-surface-secondary">
            {/* Add Comment Form */}
            <div className="py-4 sm:py-6 px-4 sm:px-6 border-b border-border-secondary">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <div className="text-center py-3 sm:py-4">
                  <span className="text-muted text-sm">Please login to comment</span>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="py-4 sm:py-6 px-4 sm:px-6">
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
                <div className="space-y-3 sm:space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                  ))}
                </div>
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

export default PostItemList; 