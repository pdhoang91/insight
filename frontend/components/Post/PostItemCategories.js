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
      <article className="bg-surface rounded-lg hover:shadow-lg transition-all duration-300 border border-border-primary/30 overflow-hidden">
        <div className="p-6">
          {/* Header with author and meta info */}

          <div className="flex gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-xl md:text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 line-clamp-2 mb-3 leading-tight">
                  {post.title}
                </h2>
              </Link>

              {/* Content Preview */}
              <div className="text-secondary text-sm md:text-base line-clamp-3 mb-4 leading-relaxed">
                <TextUtils html={post.preview_content || post.content} maxLength={180} />
              </div>

              {/* Categories - Show current category and related ones */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${(category.name || category).toLowerCase()}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      <FaTag className="w-3 h-3" />
                      <span>{category.name || category}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Image */}
            {post.image_title && (
              <div className="w-32 md:w-40 lg:w-48 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative w-full h-24 md:h-32 lg:h-36 rounded-lg overflow-hidden">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                    />
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border-primary/20">
            <div className="flex items-center gap-6">
              {/* Views */}
              <div className="flex items-center gap-2 text-muted">
                <FaEye className="w-4 h-4" />
                <span className="text-sm font-mono">{post.views || 0}</span>
              </div>

              {/* Claps */}
              <button
                onClick={handleClap}
                disabled={clapLoading}
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors disabled:opacity-50"
              >
                <FaHandsClappingRegular className="w-4 h-4" />
                <span className="text-sm font-mono">{currentClapCount}</span>
              </button>

              {/* Comments */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
              >
                <FaComment className="w-4 h-4" />
                <span className="text-sm font-mono">{post.comments_count || 0}</span>
              </button>
            </div>

            {/* Read More Link */}
            <Link 
              href={`/p/${post.title_name}`}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Read more →
            </Link>
          </div>

          {/* Comments Section - Inline */}
          {isCommentsOpen && (
            <div className="border-t border-border-primary bg-surface-secondary">
              {/* Add Comment Form */}
              <div className="p-6 border-b border-border-secondary">
                {user ? (
                  <AddCommentForm onAddComment={handleAddComment} />
                ) : (
                  <div className="text-center py-4">
                    <span className="text-muted text-sm">Please login to comment</span>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="p-6">
                {isError && (
                  <div className="text-danger text-sm text-center py-4">
                    Failed to load comments
                  </div>
                )}
                
                {isLoading && comments.length === 0 && (
                  <div className="flex justify-center items-center py-6">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-secondary text-sm">Loading comments...</span>
                  </div>
                )}

                {comments && comments.length > 0 && (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                    ))}
                  </div>
                )}

                {!isLoading && !isError && comments.length === 0 && (
                  <div className="text-center py-6">
                    <span className="text-muted text-sm">No comments yet</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
};

export default PostItemCategories; 