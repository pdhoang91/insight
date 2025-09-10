// components/Widgets/PopularPostsWidget.js
import React from 'react';
import Link from 'next/link';
import { FaFire, FaEye, FaComment, FaClock, FaHeart } from 'react-icons/fa';
import { usePopularPosts, useRecentPosts } from '../../hooks/useRecentPosts';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

// Individual Popular Post Item
const PopularPostItem = ({ post, rank, showImages, readingTime }) => {
  return (
    <article className="group">
      <Link href={`/p/${post.title_name}`} className="block">
        <div className="flex items-start space-x-3">
          {/* Rank Number */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <span className={`text-sm font-bold ${
              rank <= 3 
                ? 'text-medium-accent-green' 
                : 'text-medium-text-muted'
            }`}>
              {rank}
            </span>
          </div>

          {/* Post Image */}
          {showImages && post.featured_image && (
            <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden">
              <SafeImage
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-medium-text-primary group-hover:text-medium-accent-green transition-colors leading-snug mb-1 line-clamp-2">
              {post.title}
            </h4>
            
            <div className="flex items-center space-x-3 text-xs text-medium-text-muted">
              {/* Reading Time */}
              <div className="flex items-center space-x-1">
                <FaClock className="w-3 h-3" />
                <span>{readingTime} min read</span>
              </div>

              {/* Views */}
              {post.view_count > 0 && (
                <div className="flex items-center space-x-1">
                  <FaEye className="w-3 h-3" />
                  <span>{post.view_count}</span>
                </div>
              )}

              {/* Claps */}
              {post.clap_count > 0 && (
                <div className="flex items-center space-x-1">
                  <FaHeart className="w-3 h-3" />
                  <span>{post.clap_count}</span>
                </div>
              )}

              {/* Comments */}
              {post.comment_count > 0 && (
                <div className="flex items-center space-x-1">
                  <FaComment className="w-3 h-3" />
                  <span>{post.comment_count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

const PopularPostsWidget = ({ 
  limit = 5, 
  timeframe = 'week', // 'week', 'month', 'all'
  showImages = true,
  className = '' 
}) => {
  const { posts: popularPosts, isLoading, isError } = usePopularPosts(limit);
  const { posts: recentPosts } = useRecentPosts(limit);
  
  // Fallback to recent posts if popular posts fail
  const displayPosts = isError ? recentPosts : popularPosts;

  const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return 'Popular';
    }
  };

  if (isLoading) {
    return (
      <div className={` rounded-lg p-6 shadow-sm ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-medium-divider rounded animate-pulse"></div>
          <div className="h-5 bg-medium-divider rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <PopularPostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!popularPosts || popularPosts.length === 0) {
    return (
      <div className={` rounded-lg p-6 shadow-sm ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <FaFire className="w-4 h-4 text-medium-accent-green" />
          <h3 className="font-serif font-bold text-medium-text-primary">
            Popular Posts
          </h3>
        </div>
        <p className="text-medium-text-secondary text-sm">
          No popular posts available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={` rounded-lg p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaFire className="w-4 h-4 text-medium-accent-green" />
          <h3 className="font-serif font-bold text-medium-text-primary">
            Popular Posts
          </h3>
        </div>
        <span className="text-xs text-medium-text-muted bg-medium-bg-secondary px-2 py-1 rounded">
          {getTimeframeLabel()}
        </span>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {displayPosts && displayPosts.length > 0 ? (
          displayPosts.slice(0, limit).map((post, index) => (
            <PopularPostItem 
              key={post.id} 
              post={post} 
              rank={index + 1}
              showImages={showImages}
              readingTime={calculateReadingTime(post.content || post.preview_content)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-medium-text-muted text-sm">No popular posts available</p>
          </div>
        )}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-medium-divider">
        <Link
          href="/popular"
          className="text-sm text-medium-accent-green hover:underline"
        >
          View all popular posts →
        </Link>
      </div>
    </div>
  );
};

// Loading skeleton component
const PopularPostSkeleton = () => (
  <div className="flex items-start space-x-3 animate-pulse">
    <div className="w-6 h-6 bg-medium-divider rounded"></div>
    <div className="w-16 h-12 bg-medium-divider rounded"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-medium-divider rounded w-3/4"></div>
      <div className="flex space-x-2">
        <div className="h-3 bg-medium-divider rounded w-12"></div>
        <div className="h-3 bg-medium-divider rounded w-12"></div>
        <div className="h-3 bg-medium-divider rounded w-12"></div>
      </div>
    </div>
  </div>
);

export default PopularPostsWidget;