// components/Post/EnhancedPostItem.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaComment, 
  FaBookmark, 
  FaRegBookmark, 
  FaShareAlt, 
  FaCalendar, 
  FaUser, 
  FaEye,
  FaClock,
  FaCode,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaChevronRight,
  FaPlay
} from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import useBookmark from '../../hooks/useBookmark';
import { useComments } from '../../hooks/useComments';
import CommentsPopup from '../Comment/CommentsPopup';
import AuthorInfo from '../Auth/AuthorInfo';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import { BASE_FE_URL } from '../../config/api';

const EnhancedPostItem = ({ post, variant = 'enhanced', showFullContent = false }) => {
  if (!post) {
    return <div>Loading post...</div>;
  }

  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmark(post.id);
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const shareMenuRef = useRef();

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
  const shareUrl = `${BASE_FE_URL}/p/${post.title_name}`;
  const handleShare = () => setIsShareMenuOpen((prev) => !prev);

  // Enhanced card variant with more content
  if (variant === 'enhanced') {
    return (
      <>
        <motion.article 
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-2 group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Featured Image with Overlay */}
          {post.image_title && (
            <div className="relative h-56 w-full overflow-hidden">
              <SafeImage
                src={post.image_title}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficulty.color}`}>
                  {difficulty.level}
                </span>
                {post.average_rating > 0 && (
                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    <FaStar className="w-3 h-3" />
                    <span className="text-xs font-medium">{post.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Reading time badge */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center space-x-1">
                <FaClock className="w-3 h-3" />
                <span className="text-xs font-medium">{readingTime} min read</span>
              </div>

              {/* Play button overlay for video-like feel */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link href={`/p/${post.title_name}`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <FaPlay className="w-6 h-6 text-white ml-1" />
                  </div>
                </Link>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Author and Meta Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{post.user?.name || 'Anonymous'}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <FaCalendar className="w-3 h-3" />
                      <TimeAgo timestamp={post.created_at} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* View count */}
              <div className="flex items-center space-x-1 text-gray-500">
                <FaEye className="w-4 h-4" />
                <span className="text-sm">{post.views || 0}</span>
              </div>
            </div>

            {/* Title with better typography */}
            <Link href={`/p/${post.title_name}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                {post.title}
              </h3>
            </Link>

            {/* Enhanced Excerpt */}
            <div className="mb-4">
              <div className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-2">
                <TextUtils html={post.preview_content} maxLength={showFullContent ? 300 : 180} />
              </div>
              {!showFullContent && post.preview_content?.length > 180 && (
                <button 
                  onClick={() => setShowReadMore(!showReadMore)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <span>Read more</span>
                  <FaChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Categories and Tags */}
            <div className="mb-4 space-y-2">
              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.slice(0, 2).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${typeof category === 'string' ? category.toLowerCase() : category.name?.toLowerCase()}`}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold hover:bg-purple-100 transition-colors flex items-center space-x-1"
                    >
                      <FaCode className="w-3 h-3" />
                      <span>{typeof category === 'string' ? category : category.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 4).map((tag, index) => (
                    <Link
                      key={index}
                      href={`/tag/${typeof tag === 'string' ? tag.toLowerCase() : tag.name?.toLowerCase()}`}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      #{typeof tag === 'string' ? tag : tag.name}
                    </Link>
                  ))}
                  {post.tags.length > 4 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                      +{post.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                {/* Clap with animation */}
                <motion.button
                  onClick={handleClap}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Clap for this post"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <FaHandsClapping className="w-5 h-5 group-hover:text-red-500" />
                  </motion.div>
                  <span className="text-sm font-semibold">{clapsCount}</span>
                </motion.button>

                {/* Comments with better styling */}
                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                  aria-label="View comments"
                >
                  <FaComment className="w-4 h-4" />
                  <span className="text-sm font-semibold">{totalCommentReply}</span>
                </button>

                {/* Like button (additional engagement) */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-1 transition-colors ${
                    isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                  }`}
                  aria-label="Like this post"
                >
                  {isLiked ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {/* Bookmark with animation */}
                <motion.button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className={`p-2 rounded-lg transition-all ${
                    isBookmarked 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                >
                  {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                </motion.button>

                {/* Share with dropdown */}
                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                    aria-label="Share this post"
                  >
                    <FaShareAlt className="w-4 h-4" />
                  </button>
                  
                  {isShareMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(shareUrl)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          Copy link
                        </button>
                        <button
                          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`, '_blank')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          Share on Twitter
                        </button>
                        <button
                          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          Share on LinkedIn
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Read more arrow */}
                <Link href={`/p/${post.title_name}`}>
                  <motion.div
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span>Read</span>
                    <FaChevronRight className="w-3 h-3" />
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
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