// components/Post/CompactPostItem.js
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEye, FaClock, FaComment, FaCode } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import TextUtils from '../Utils/TextUtils';

const CompactPostItem = ({ post, showImage = true, showStats = true, minimal = false }) => {
  if (!post) return null;

  // Calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  // Get difficulty level
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

  // Minimal version for Latest Posts
  if (minimal) {
    return (
      <Link href={`/p/${post.title_name}`}>
        <div className="flex items-start gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-3 rounded hover:bg-terminal-light transition-colors group cursor-pointer">
          {showImage && (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 relative">
              {post.image_title ? (
                <SafeImage
                  src={post.image_title}
                  alt={post.title}
                  fill
                  className="object-cover rounded group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 40px, 48px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-matrix-green/20 to-hacker-blue/20 flex items-center justify-center rounded">
                  <FaCode className="w-3 h-3 sm:w-4 sm:h-4 text-matrix-green" />
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-medium text-text-primary hover:text-matrix-green transition-colors line-clamp-2 mb-1">
              {post.title}
            </h4>
            <p className="text-xs text-text-secondary line-clamp-1 sm:line-clamp-2">
              <TextUtils html={post.preview_content} maxLength={60} />
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.article 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        {showImage && (
          <div className="flex-shrink-0 w-full sm:w-20 h-32 sm:h-20 relative">
            {post.image_title ? (
              <SafeImage
                src={post.image_title}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 80px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <FaCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 py-3 sm:py-4 px-3 sm:px-4 flex flex-col justify-between">
          {/* Header */}
          <div>
            <Link href={`/p/${post.title_name}`}>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {post.title}
              </h3>
            </Link>
            
            {/* Preview */}
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
              <TextUtils html={post.preview_content} maxLength={100} />
            </p>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.categories.slice(0, 2).map((category, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium"
                  >
                    {typeof category === 'string' ? category : category?.name || ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <FaHandsClapping className="w-3 h-3" />
                  <span>{post.clap_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="w-3 h-3" />
                  <span>{post.comments_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaEye className="w-3 h-3" />
                  <span>{post.views || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  <span>{readingTime}m</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${difficulty.color}`}>
                  {difficulty.level}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default CompactPostItem; 