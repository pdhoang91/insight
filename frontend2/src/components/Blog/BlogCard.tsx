'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'compact';
}

const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'default' }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (variant === 'compact') {
    return (
      <article className="group cursor-pointer">
        <Link href={`/blog/${post.slug}`}>
          <div className="flex space-x-4">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={post.image.url}
                alt={post.image.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${post.category.color}`}>
                  {post.category.name}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center text-xs text-gray-500 space-x-3">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span>{post.readTime} min</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
        <Image
          src={post.image.url}
          alt={post.image.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Author and Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-gray-700 font-medium">{post.author.name}</span>
            </div>
            <span className="text-gray-500">{formatDate(post.publishedAt)}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-medium text-gray-900 leading-tight line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          {/* Read More Button */}
          <div className="pt-2">
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-sm rounded-lg transition-colors duration-200 group"
            >
              <span className="uppercase tracking-wide">Read More</span>
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard; 