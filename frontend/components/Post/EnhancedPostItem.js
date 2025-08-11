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
      <motion.article
        className="bg-terminal-gray rounded-lg border border-terminal-border hover:border-matrix-green/50 transition-all duration-300 group overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Terminal Header */}
        <div className="bg-terminal-light px-3 sm:px-4 py-2 border-b border-terminal-border">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-hacker-red rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-hacker-yellow rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-matrix-green rounded-full"></span>
              </span>
              <span className="text-matrix-green">post@{post.id}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <FaClock className="w-3 h-3" />
              <TimeAgo timestamp={post.created_at} />
            </div>
          </div>
        </div>

        <div className="py-4 sm:py-6 px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 order-2 lg:order-1">
              {/* Author Info */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-matrix-green/20 rounded-full border border-matrix-green/50 flex items-center justify-center flex-shrink-0">
                  <FaUser className="w-3 h-3 sm:w-4 sm:h-4 text-matrix-green" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-text-secondary min-w-0 font-mono">
                  <span className="text-matrix-green">$</span>
                  <span className="font-medium text-text-primary truncate">
                    {post.user?.name || 'anonymous'}
                  </span>
                  <span className="hidden sm:inline text-text-muted">@terminal</span>
                  <span className="text-text-muted sm:hidden">
                    <TimeAgo timestamp={post.created_at} />
                  </span>
                </div>
              </div>

              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary hover:text-matrix-green transition-colors duration-300 line-clamp-2 mb-3 sm:mb-4 cursor-pointer">
                  {post.title}
                </h2>
              </Link>

              {/* Content Preview */}
              <div className="text-text-secondary text-sm sm:text-base line-clamp-3 sm:line-clamp-4 lg:line-clamp-6 mb-4 sm:mb-6 leading-relaxed">
                <TextUtils 
                  html={showFullContent ? post.content : post.preview_content} 
                  maxLength={showFullContent ? 10000 : 6000} 
                />
              </div>

              {/* Categories & Tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {post.categories && post.categories.slice(0, 3).map((category, index) => (
                  <Link
                    key={index}
                    href={`/category/${(category.name || category).toLowerCase()}`}
                    className="px-2 sm:px-3 py-1 bg-matrix-green/10 text-matrix-green rounded-full text-xs font-medium hover:bg-matrix-green/20 transition-colors border border-matrix-green/20"
                  >
                    <FaTag className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
                    {category.name || category}
                  </Link>
                ))}
                
                {post.tags && post.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-hacker-blue/10 text-hacker-blue rounded-full text-xs font-medium border border-hacker-blue/20"
                  >
                    #{typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>

              {/* Metrics Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-muted mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5">
                  <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{calculateReadingTime(post.content)} min read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaChartLine className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="px-2 py-1 bg-hacker-orange/10 text-hacker-orange rounded text-xs">
                    {getDifficultyLevel(post.tags, post.categories)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="sm:hidden">
                    <TimeAgo timestamp={post.created_at} />
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between border-t border-terminal-border pt-3 sm:pt-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Claps */}
                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center gap-1.5 sm:gap-2 text-text-muted hover:text-hacker-yellow transition-colors font-mono"
                  >
                    <FaHandsClapping className={`w-4 h-4 sm:w-5 sm:h-5 ${clapLoading ? 'animate-pulse' : ''}`} />
                    <span className="text-sm sm:text-base">{currentClapCount}</span>
                  </button>

                  {/* Comments */}
                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center gap-1.5 sm:gap-2 text-text-muted hover:text-matrix-green transition-colors font-mono"
                  >
                    <FaComment className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{post.comments_count || 0}</span>
                  </button>

                  {/* Views */}
                  <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted font-mono">
                    <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{post.views || 0}</span>
                  </div>
                </div>

                {/* Share & Bookmark */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button className="p-1.5 sm:p-2 text-text-muted hover:text-hacker-blue transition-colors rounded-full hover:bg-hacker-blue/10">
                    <FaShareAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button className="p-1.5 sm:p-2 text-text-muted hover:text-hacker-purple transition-colors rounded-full hover:bg-hacker-purple/10">
                    <FaBookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            {post.image_title && (
              <div className="w-full lg:w-1/3 order-1 lg:order-2 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative w-full h-48 sm:h-56 lg:h-64 group-hover:scale-105 transition-transform duration-300 overflow-hidden rounded-lg">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-terminal-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {isCommentsOpen && (
          <div className="border-t border-terminal-border bg-terminal-dark">
            <div className="py-4 sm:py-6 px-4 sm:px-6">
              {/* Add Comment Form */}
              {user ? (
                <div className="mb-4 sm:mb-6">
                  <AddCommentForm onAddComment={handleAddComment} />
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6 border border-matrix-green/30 rounded-lg bg-matrix-green/5 mb-4 sm:mb-6">
                  <span className="text-text-muted text-sm font-mono">
                    $ echo "Please login to comment"
                  </span>
                </div>
              )}

              {/* Comments List */}
              {isError && (
                <div className="text-hacker-red text-sm text-center py-4 sm:py-6 font-mono">
                  ERROR: Failed to load comments
                </div>
              )}
              
              {isLoading && comments.length === 0 && (
                <div className="flex justify-center items-center py-6 sm:py-8">
                  <div className="w-4 h-4 border-2 border-matrix-green border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-text-secondary text-sm font-mono">Loading comments...</span>
                </div>
              )}

              {comments && comments.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                  ))}
                </div>
              )}

              {!isLoading && !isError && comments.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <span className="text-text-muted text-sm font-mono">
                    $ ls comments/
                    <br />
                    <span className="text-hacker-yellow">No comments found</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.article>
    );
  }

  // Fallback to original PostItem for other variants
  return null;
};

export default EnhancedPostItem; 