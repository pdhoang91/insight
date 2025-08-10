// components/Post/PostItemTimeline.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaComment, FaEye } from 'react-icons/fa';
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
    return <div>Loading post...</div>;
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
      alert('You need to login to comment.');
      return;
    }
    if (!content.trim()) {
      alert('Comment content cannot be empty.');
      return;
    }
    try {
      await addComment(post.id, content); // Only pass postId and content
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

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
              {/* Claps */}
              <button
                onClick={handleClap}
                disabled={clapLoading}
                className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
              >
                <FaHandsClapping className="w-4 h-4" />
                <span className="text-sm">{currentClapCount}</span>
              </button>

              {/* Comments */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
              >
                <FaComment className="w-4 h-4" />
                <span className="text-sm">{post.comments_count || 0}</span>
              </button>

              {/* Views */}
              <div className="flex items-center gap-1 text-muted">
                <FaEye className="w-4 h-4" />
                <span className="text-sm">{post.views || 0}</span>
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

        {/* Compact Comments Section - Inside the article */}
        {isCommentsOpen && (
          <div className="border-t border-border-primary">
            {/* Compact Header */}

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
        
      </article>
    </div>
  );
};

export default PostItemTimeline; 