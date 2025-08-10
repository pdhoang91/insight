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
} from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import CommentsPopup from '../Comment/CommentsPopup';

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

  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, true, 1, 10);

  // Calculate reading time (rough estimate: 200 words per minute)
  const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes;
  };

  // Determine difficulty level based on tags
  const getDifficultyLevel = (tags = [], categories = []) => {
    const beginnerKeywords = ['tutorial', 'beginner', 'intro', 'getting-started', 'basics'];
    const advancedKeywords = ['advanced', 'expert', 'deep-dive', 'architecture', 'optimization'];

    // Safely extract names from tags and categories - handle null/undefined arrays
    const tagNames = (tags || []).map(tag => typeof tag === 'string' ? tag : tag?.name || '').filter(Boolean);
    const categoryNames = (categories || []).map(cat => typeof cat === 'string' ? cat : cat?.name || '').filter(Boolean);

    const allKeywords = [...tagNames, ...categoryNames].join(' ').toLowerCase();

    if (advancedKeywords.some(keyword => allKeywords.includes(keyword))) {
      return { level: 'Advanced', color: 'text-red-600 bg-red-50' };
    } else if (beginnerKeywords.some(keyword => allKeywords.includes(keyword))) {
      return { level: 'Beginner', color: 'text-green-600 bg-green-50' };
    }
    return { level: 'Intermediate', color: 'text-blue-600 bg-blue-50' };
  };

  const readingTime = calculateReadingTime(post.content || post.preview_content);
  const difficulty = getDifficultyLevel(post.tags, post.categories);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const closeCommentPopup = () => setCommentsOpen(false);

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
            {post.image_title && (
              <div className="w-48 md:w-56 lg:w-64 flex-shrink-0 relative">
                <div className="relative h-32 md:h-36 lg:h-40 w-full overflow-hidden">
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-l-xl"
                    sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />

                  {/* Reading time badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded flex items-center space-x-1">
                    <FaClock className="w-2 h-2" />
                    <span className="text-xs font-medium">{readingTime}m</span>
                  </div>

                  {/* Category badge */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 bg-primary/90 text-white rounded text-xs font-medium">
                        {post.categories[0].name || post.categories[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Side - Content */}
            <div className="flex-1 p-5">
              {/* Compact Author and Meta Info */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">
                    {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted">
                  <span className="font-medium text-secondary">{post.user?.name || 'Anonymous'}</span>
                  <span>•</span>
                  <TimeAgo timestamp={post.created_at} />
                </div>
              </div>

              {/* Title - More prominent */}
              <Link href={`/p/${post.title_name}`}>
                <h3 className="text-lg md:text-xl font-bold text-primary mb-3 hover:text-primary-hover transition-colors leading-tight line-clamp-2 cursor-pointer">
                  {post.title}
                </h3>
              </Link>

              {/* Content Preview - Compact for horizontal layout */}
              <div className="text-secondary text-sm leading-relaxed mb-4 line-clamp-2">
                <TextUtils html={post.preview_content} maxLength={150} />
              </div>

              {/* Additional Categories - Compact */}
              {post.categories && post.categories.length > 1 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.categories.slice(1, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${category.toLowerCase()}`}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}

              {/* Actions Bar - Bottom */}
              <div className="flex items-center justify-between pt-3 border-t border-border-primary">
                <div className="flex items-center space-x-4">
                  {/* Views */}
                  <div className="flex items-center space-x-1 text-muted">
                    <FaEye className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.views || 0}</span>
                  </div>

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

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleBookmark}
                    disabled={bookmarkLoading}
                    className="p-1 text-muted hover:text-primary transition-colors"
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                  >
                    {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                  </button>

                  <div className="relative" ref={shareMenuRef}>
                    <button
                      onClick={handleShare}
                      className="p-1 text-muted hover:text-primary transition-colors"
                      aria-label="Share this post"
                    >
                      <FaShareAlt className="w-4 h-4" />
                    </button>

                    {/* Share Menu */}
                    {isShareMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-2 w-32 bg-surface border border-border-primary rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            setIsShareMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1 text-xs text-secondary hover:text-primary hover:bg-elevated transition-colors"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank');
                            setIsShareMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1 text-xs text-secondary hover:text-primary hover:bg-elevated transition-colors"
                        >
                          Twitter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layout for posts without images */}
          {!post.image_title && (
            <div className="p-5">
              {/* Compact Author and Meta Info */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">
                    {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted">
                  <span className="font-medium text-secondary">{post.user?.name || 'Anonymous'}</span>
                  <span>•</span>
                  <TimeAgo timestamp={post.created_at} />
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <FaClock className="w-2 h-2" />
                    <span>{readingTime}m read</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h3 className="text-lg md:text-xl font-bold text-primary mb-3 hover:text-primary-hover transition-colors leading-tight line-clamp-2 cursor-pointer">
                  {post.title}
                </h3>
              </Link>

              {/* Content Preview */}
              <div className="text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                <TextUtils html={post.preview_content} maxLength={200} />
              </div>

              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.categories.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${category.toLowerCase()}`}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-border-primary">
                <div className="flex items-center space-x-4">
                  {/* Views */}
                  <div className="flex items-center space-x-1 text-muted">
                    <FaEye className="w-4 h-4" />
                    <span className="text-sm font-medium">{post.views || 0}</span>
                  </div>

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

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleBookmark}
                    disabled={bookmarkLoading}
                    className="p-1 text-muted hover:text-primary transition-colors"
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                  >
                    {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                  </button>

                  <div className="relative" ref={shareMenuRef}>
                    <button
                      onClick={handleShare}
                      className="p-1 text-muted hover:text-primary transition-colors"
                      aria-label="Share this post"
                    >
                      <FaShareAlt className="w-4 h-4" />
                    </button>

                    {/* Share Menu */}
                    {isShareMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-2 w-32 bg-surface border border-border-primary rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            setIsShareMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1 text-xs text-secondary hover:text-primary hover:bg-elevated transition-colors"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank');
                            setIsShareMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1 text-xs text-secondary hover:text-primary hover:bg-elevated transition-colors"
                        >
                          Twitter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.article>

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

  // Fallback to original PostItem for other variants
  return null;
};

export default EnhancedPostItem; 