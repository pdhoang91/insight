'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import { formatRelativeTime, truncateText } from '@/lib/utils';

interface BlogCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
  showCategories?: boolean;
  showAuthor?: boolean;
  showExcerpt?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({
  post,
  variant = 'default',
  showCategories = true,
  showAuthor = true,
  showExcerpt = true,
}) => {
  const cardVariants = {
    default: "group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200",
    featured: "group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300",
    compact: "group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
  };

  const imageVariants = {
    default: "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500",
    featured: "w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500",
    compact: "w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
  };

  const titleVariants = {
    default: "text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2",
    featured: "text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2",
    compact: "text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2"
  };

  const contentPadding = {
    default: "p-6",
    featured: "p-8",
    compact: "p-4"
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cardVariants[variant]}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Image */}
        {post.image && (
          <div className="relative overflow-hidden bg-gray-100">
            <Image
              src={post.image}
              alt={post.title}
              width={variant === 'featured' ? 800 : 400}
              height={variant === 'featured' ? 320 : variant === 'compact' ? 128 : 192}
              className={imageVariants[variant]}
            />
            {/* Reading time overlay */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {post.readTime} min read
            </div>
            {/* Gradient overlay for better text readability on featured posts */}
            {variant === 'featured' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            )}
          </div>
        )}

        <div className={contentPadding[variant]}>
          {/* Categories */}
          {showCategories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: `${category.bgColor}20`,
                    color: category.color,
                    border: `1px solid ${category.bgColor}40`
                  }}
                >
                  {category.name}
                </span>
              ))}
              {post.categories.length > 2 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{post.categories.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h2 className={titleVariants[variant]}>
            {post.title}
          </h2>

          {/* Excerpt */}
          {showExcerpt && post.excerpt && variant !== 'compact' && (
            <p className="text-gray-600 mt-3 line-clamp-3 leading-relaxed">
              {truncateText(post.excerpt, variant === 'featured' ? 200 : 120)}
            </p>
          )}

          {/* Author and Meta */}
          {showAuthor && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.username}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {post.author.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {post.author.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(post.publishedAt || post.createdAt)}
                  </p>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likesCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.commentsCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tags for compact variant */}
          {variant === 'compact' && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Action buttons for featured variant */}
      {variant === 'featured' && (
        <div className="px-8 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-full transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {post.viewsCount.toLocaleString()} views
            </div>
          </div>
        </div>
      )}
    </motion.article>
  );
};

export default BlogCard; 