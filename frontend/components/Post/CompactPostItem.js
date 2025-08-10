// components/Post/CompactPostItem.js
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEye, FaClock, FaComment, FaCode } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import TextUtils from '../Utils/TextUtils';

const CompactPostItem = ({ post, showImage = true, showStats = true }) => {
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

  return (
    <motion.article 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex">
        {/* Image Section */}
        {showImage && (
          <div className="flex-shrink-0 w-20 h-20 relative">
            {post.image_title ? (
              <SafeImage
                src={post.image_title}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <FaCode className="w-6 h-6 text-blue-600" />
              </div>
            )}
            
            {/* Difficulty badge overlay */}
            <div className="absolute top-1 left-1">
              <span className={`px-1 py-0.5 rounded text-xs font-medium ${difficulty.color}`}>
                {difficulty.level.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 p-3 min-w-0">
          {/* Header with meta info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">{post.user?.name || 'Anonymous'}</span>
              <span>•</span>
              <TimeAgo timestamp={post.created_at} />
            </div>
            
            {showStats && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <FaClock className="w-3 h-3" />
                  <span>{readingTime}m</span>
                </div>
                {post.views > 0 && (
                  <div className="flex items-center space-x-1">
                    <FaEye className="w-3 h-3" />
                    <span>{post.views}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <Link href={`/p/${post.title_name}`}>
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer mb-1 leading-tight">
              {post.title}
            </h4>
          </Link>

          {/* Preview */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
            <TextUtils html={post.preview_content} maxLength={100} />
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.slice(0, 2).map((tag, index) => (
                <Link
                  key={index}
                  href={`/tag/${typeof tag === 'string' ? tag.toLowerCase() : tag.name?.toLowerCase()}`}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  #{typeof tag === 'string' ? tag : tag.name}
                </Link>
              ))}
              {post.tags.length > 2 && (
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Stats Footer */}
          {showStats && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <FaHandsClapping className="w-3 h-3" />
                  <span>{post.clap_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaComment className="w-3 h-3" />
                  <span>{post.comments_count || 0}</span>
                </div>
              </div>
              
              {/* Category indicator */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex items-center space-x-1">
                  <FaCode className="w-3 h-3 text-purple-500" />
                  <span className="text-purple-600 font-medium">
                    {typeof post.categories[0] === 'string' 
                      ? post.categories[0] 
                      : post.categories[0]?.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default CompactPostItem; 