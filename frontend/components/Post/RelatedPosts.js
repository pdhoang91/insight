// components/Post/RelatedPosts.js
import React from 'react';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const RelatedPosts = ({ posts = [], currentPostId, className = '' }) => {
  // Filter out current post and limit to 3 related posts
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div className={`bg-medium-bg-card rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-medium-text-primary">Related Articles</h3>
        <Link 
          href="/search"
          className="text-sm text-medium-accent-green hover:text-medium-accent-green/80 transition-colors duration-200"
        >
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {relatedPosts.map((post, index) => (
          <article key={post.id} className="group">
            <Link href={`/p/${post.title_name}`} className="block">
              <div className="flex gap-4 p-3 rounded-lg hover:bg-medium-hover transition-colors duration-200">
                {/* Thumbnail */}
                {post.image_title && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-medium-bg-secondary">
                    <img
                      src={post.image_title}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-medium-text-primary text-sm line-clamp-2 group-hover:text-medium-accent-green transition-colors duration-200 mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-medium-text-muted">
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString('vi-VN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                    <span className="w-1 h-1 bg-medium-text-muted rounded-full"></span>
                    <span>{Math.ceil((post.content?.length || 0) / 1000)} min read</span>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex-shrink-0 flex items-center">
                  <FaArrowRight className="w-3 h-3 text-medium-text-muted group-hover:text-medium-accent-green group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
