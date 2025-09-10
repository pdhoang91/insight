// components/Article/RelatedArticles.js
import React from 'react';
import Link from 'next/link';
import { FaUser, FaClock } from 'react-icons/fa';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import { themeClasses } from '../../utils/themeClasses';

const RelatedArticles = ({ currentPostId, categories = [], tags = [], limit = 3 }) => {
  // For now, we'll use recent posts. In a real implementation, 
  // this would be a more sophisticated recommendation algorithm
  const { posts: relatedPosts, isLoading } = useRecentPosts(limit + 1);

  // Filter out current post and limit results
  const filteredPosts = relatedPosts?.filter(post => post.id !== currentPostId).slice(0, limit) || [];

  if (isLoading) {
    return (
      <div className={`${themeClasses.layout.reading} py-12`}>
        <div className="space-y-6">
          <div className="h-6 bg-medium-divider rounded w-48 animate-pulse"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <RelatedArticleSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!filteredPosts.length) {
    return null;
  }

  return (
    <div className={`${themeClasses.layout.reading} py-12`}>
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-medium-text-primary mb-2">
          More from Insight
        </h2>
        <div className="w-16 h-0.5 bg-medium-accent-green"></div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <RelatedArticleCard key={post.id} post={post} />
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-medium-accent-green text-medium-accent-green hover:bg-medium-accent-green hover:text-white transition-colors rounded-full font-medium"
        >
          View all articles
        </Link>
      </div>
    </div>
  );
};

// Individual Related Article Card
const RelatedArticleCard = ({ post }) => {
  // Calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  const readingTime = calculateReadingTime(post.content || post.preview_content);

  return (
    <article className="group cursor-pointer">
      <Link href={`/p/${post.title_name}`} className="block">
        {/* Featured Image */}
        {post.image_title && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <SafeImage
              src={post.image_title}
              alt={post.title}
              width={300}
              height={200}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Article Info */}
        <div className="space-y-3">
          {/* Author & Date */}
          <div className="flex items-center space-x-2 text-sm text-medium-text-muted">
            <div className="flex items-center space-x-2">
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 bg-medium-accent-green rounded-full flex items-center justify-center">
                  <FaUser className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <span>{post.user?.name || 'Anonymous'}</span>
            </div>
            <span>·</span>
            <TimeAgo timestamp={post.created_at} />
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-medium-text-primary group-hover:text-medium-accent-green transition-colors leading-tight">
            {post.title}
          </h3>

          {/* Preview */}
          {post.preview_content && (
            <p className="text-medium-text-secondary text-sm leading-relaxed line-clamp-2">
              {post.preview_content.replace(/<[^>]*>/g, '').substring(0, 120)}
              {post.preview_content.length > 120 && '...'}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-medium-text-muted">
            <div className="flex items-center space-x-1">
              <FaClock className="w-3 h-3" />
              <span>{readingTime} min read</span>
            </div>

            {/* Category */}
            {post.categories && post.categories.length > 0 && (
              <span className="px-2 py-1 bg-medium-bg-secondary rounded-full">
                {post.categories[0].name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

// Skeleton Loader for Related Articles
const RelatedArticleSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-medium-divider rounded-lg"></div>
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 bg-medium-divider rounded-full"></div>
        <div className="h-3 bg-medium-divider rounded w-20"></div>
        <div className="h-3 bg-medium-divider rounded w-16"></div>
      </div>
      <div className="h-5 bg-medium-divider rounded"></div>
      <div className="space-y-2">
        <div className="h-3 bg-medium-divider rounded"></div>
        <div className="h-3 bg-medium-divider rounded w-3/4"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 bg-medium-divider rounded w-16"></div>
        <div className="h-3 bg-medium-divider rounded w-12"></div>
      </div>
    </div>
  </div>
);

export default RelatedArticles;
