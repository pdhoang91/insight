// components/Post/EnhancedPostItem.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaComment,
  FaCalendar,
  FaUser,
  FaEye,
  FaClock,
  FaTag,
  FaChartLine,
  FaBookmark,
  FaShareAlt,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
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

const EnhancedPostItem = ({ post, variant = 'enhanced', showFullContent = false }) => {
  if (!post) {
    return <div>Loading post...</div>;
  }

  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);

  // Only load comments when the popup is actually open
  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, isCommentsOpen, 1, 10);

  // Calculate reading time (rough estimate: 200 words per minute)
  const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes;
  };

  // Determine difficulty level based on tags
  const getDifficultyLevel = (tags = [], categories = []) => {
    const allTags = [...(tags || []), ...(categories || [])];
    const beginnerTags = ['beginner', 'tutorial', 'basics', 'intro'];
    const advancedTags = ['advanced', 'expert', 'complex', 'deep-dive'];
    
    if (allTags.some(tag => beginnerTags.includes(tag.toLowerCase()))) return 'Beginner';
    if (allTags.some(tag => advancedTags.includes(tag.toLowerCase()))) return 'Advanced';
    return 'Intermediate';
  };

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

  // Enhanced variant with horizontal layout
  if (variant === 'enhanced') {
    return (
      <>
        <motion.article
          className="bg-surface rounded-xl shadow-sm border border-border-primary overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex">
            {/* Left Side - Image with Overlay */}
            <div className="w-2/5 relative">
              <Link href={`/p/${post.title_name}`}>
                <div className="relative h-80 overflow-hidden">
                  <SafeImage
                    src={post.image_title || '/images/placeholder.svg'}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Stats */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <div className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <FaEye className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">{post.views || 0}</span>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <FaClock className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">{calculateReadingTime(post.content)} min</span>
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      getDifficultyLevel(post.tags, post.categories) === 'Beginner' 
                        ? 'bg-green-500/20 text-green-300' 
                        : getDifficultyLevel(post.tags, post.categories) === 'Advanced'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {getDifficultyLevel(post.tags, post.categories)}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Side - Content */}
            <div className="w-3/5 p-6 flex flex-col">
              {/* Author & Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{post.user?.name || 'Anonymous'}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted">
                      <FaCalendar className="w-3 h-3" />
                      <TimeAgo timestamp={post.created_at} />
                    </div>
                  </div>
                </div>
                
                {/* Trending Indicator */}
                {post.views > 100 && (
                  <div className="flex items-center space-x-1 text-orange-500">
                    <FaChartLine className="w-4 h-4" />
                    <span className="text-xs font-medium">Trending</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h3 className="text-xl font-bold text-primary hover:text-primary-hover transition-colors line-clamp-2 mb-3 group-hover:text-primary-hover">
                  {post.title}
                </h3>
              </Link>

              {/* Content Preview */}
              <div className="text-secondary text-sm line-clamp-3 mb-4 flex-1">
                <TextUtils html={post.preview_content} maxLength={150} />
              </div>

              {/* Tags */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${(category.name || category).toLowerCase()}`}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      <FaTag className="w-3 h-3" />
                      <span>{category.name || category}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                    aria-label="Clap for this post"
                  >
                    <FaHandsClapping className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentClapCount}</span>
                  </button>

                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                    aria-label="View comments"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.comments_count || 0}</span>
                  </button>
                </div>

                {/* Read More Button */}
                <Link
                  href={`/p/${post.title_name}`}
                  className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </div>

          {/* Compact variant (when space is limited) */}
          {variant === 'compact' && (
            <div className="p-4">
              <div className="flex space-x-4">
                {/* Small Image */}
                <div className="w-20 h-20 flex-shrink-0">
                  <Link href={`/p/${post.title_name}`}>
                    <SafeImage
                      src={post.image_title || '/images/placeholder.svg'}
                      alt={post.title}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link href={`/p/${post.title_name}`}>
                    <h4 className="font-semibold text-primary hover:text-primary-hover transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                  </Link>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted mb-2">
                    <span>{post.user?.name || 'Anonymous'}</span>
                    <TimeAgo timestamp={post.created_at} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleClap}
                        disabled={clapLoading}
                        className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                        aria-label="Clap for this post"
                      >
                        <FaHandsClapping className="w-4 h-4" />
                        <span className="text-sm font-medium">{currentClapCount}</span>
                      </button>

                      <button
                        onClick={toggleCommentPopup}
                        className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                        aria-label="View comments"
                      >
                        <FaComment className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.comments_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
        </motion.article>
      </>
    );
  }

  // Fallback to original PostItem for other variants
  return null;
};

export default EnhancedPostItem; 