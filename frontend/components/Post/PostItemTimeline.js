// components/Post/PostItemTimeline.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaComment, FaBookmark, FaRegBookmark, FaShareAlt, FaEllipsisH } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import useBookmark from '../../hooks/useBookmark';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import AddCommentForm from '../Comment/AddCommentForm';
import CommentItem from '../Comment/CommentItem';
import { addComment } from '../../services/commentService';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import { BASE_FE_URL } from '../../config/api';

const PostItemTimeline = ({ post }) => {
  if (!post) {
    return <div>Loading post...</div>;
  }

  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmark(post.id);
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [isShareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef();
  
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClap = async () => {
    if (!user) {
      alert('You need to login to clap.');
      return;
    }
    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      mutateClaps();
      alert('An error occurred while clapping. Please try again.');
    }
  };

  const toggleCommentPopup = () => setCommentsOpen((prev) => !prev);
  const closeCommentPopup = () => setCommentsOpen(false);

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Bạn cần đăng nhập để bình luận.');
      return;
    }
    if (!content.trim()) {
      alert('Nội dung bình luận không được để trống.');
      return;
    }
    try {
      await addComment(post.id, content, user.id);
      mutate();
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Gửi bình luận thất bại. Vui lòng thử lại.');
    }
  };
  const shareUrl = `${BASE_FE_URL}/p/${post.title_name}`;
  const handleShare = () => setShareMenuOpen((prev) => !prev);

  return (
    <div className="w-full">
      <article className="bg-surface rounded-xl hover:shadow-lg transition-all duration-300">
        <div className="flex p-6">
          {/* Left Side - Content (2/3) */}
          <div className="flex-1 pr-6">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-bold">
                  {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="font-medium text-secondary">{post.user?.name || 'Anonymous'}</span>
                <span>•</span>
                <TimeAgo timestamp={post.created_at} />
              </div>
            </div>

            {/* Title */}
            <Link href={`/p/${post.title_name}`}>
              <h2 className="text-xl md:text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 line-clamp-2 mb-3">
                {post.title}
              </h2>
            </Link>

            {/* Content Preview */}
            <div className="text-secondary text-sm md:text-base line-clamp-2 mb-4">
              <TextUtils html={post.preview_content} maxLength={200} />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories && post.categories.slice(0, 2).map((category, index) => (
                <Link
                  key={index}
                  href={`/category/${category.toLowerCase()}`}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>

            {/* Action Icons - Bottom of left content */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleClap}
                disabled={clapsLoading}
                className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
              >
                <FaHandsClapping className="w-4 h-4" />
                {clapsCount > 0 && <span className="text-sm">{clapsCount}</span>}
              </button>

              <button
                onClick={toggleCommentPopup}
                className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
              >
                <FaComment className="w-4 h-4" />
                {totalCount > 0 && <span className="text-sm">{totalCount}</span>}
              </button>

              <button
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                className="text-muted hover:text-primary transition-colors"
              >
                {isBookmarked ? (
                  <FaBookmark className="w-4 h-4" />
                ) : (
                  <FaRegBookmark className="w-4 h-4" />
                )}
              </button>

              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={handleShare}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <FaEllipsisH className="w-4 h-4" />
                </button>

                {isShareMenuOpen && (
                  <div className="absolute right-0 top-8 bg-surface border border-border-primary rounded-lg shadow-lg py-2 w-48 z-10">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setShareMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-secondary hover:text-primary hover:bg-elevated transition-colors flex items-center gap-2"
                    >
                      <FaShareAlt className="w-3 h-3" />
                      Copy link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Image (1/3) */}
          {post.image_title && (
            <div className="w-1/3 flex items-end">
              <Link href={`/p/${post.title_name}`} className="w-full">
                <div className="relative w-full h-32 md:h-40 lg:h-48">
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300 rounded-lg"
                    sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                  />
                </div>
              </Link>
            </div>
          )}
        </div>
      </article>

      {/* Compact Comments Section */}
      {isCommentsOpen && (
        <div className="bg-elevated border-t border-border-primary mt-2">
          {/* Compact Header */}
          <div className="flex items-center justify-between p-3 border-b border-border-primary">
            <span className="text-sm font-medium text-secondary font-mono">
              {totalCount} comments
            </span>
            <button
              onClick={closeCommentPopup}
              className="text-muted hover:text-primary transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {/* Compact Add Comment */}
          <div className="p-3 border-b border-border-primary">
            {user ? (
              <AddCommentForm onAddComment={handleAddComment} />
            ) : (
              <div className="text-center py-2">
                <span className="text-muted text-sm font-mono">Login to comment</span>
              </div>
            )}
          </div>

          {/* Compact Comments List */}
          <div className="p-3">
            {isError && (
              <div className="text-red-400 text-sm font-mono text-center py-2">
                Failed to load comments
              </div>
            )}
            
            {isLoading && comments.length === 0 && (
              <div className="flex justify-center items-center py-4">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-secondary text-sm font-mono">Loading...</span>
              </div>
            )}

            {comments && comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                ))}
                
                {canLoadMore && (
                  <div className="text-center pt-2">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="text-sm text-primary hover:text-primary-hover font-mono disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : `Load more (${totalCount - comments.length} left)`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !isError && comments.length === 0 && (
              <div className="text-center py-4">
                <span className="text-muted text-sm font-mono">No comments yet</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostItemTimeline; 