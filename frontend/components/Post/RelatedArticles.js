// components/Post/RelatedArticles.js - Medium 2024 Design
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '../UI/Card';
import Avatar from '../UI/Avatar';
import TimeAgo from '../Utils/TimeAgo';
import { useRecentPosts } from '../../hooks/useRecentPosts';

const RelatedArticles = ({ currentPost, limit = 4, className = '' }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // For now, use recent posts as related articles
  // TODO: Implement proper recommendation algorithm
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(20);

  useEffect(() => {
    if (recentPosts && currentPost) {
      // Filter out current post and get related posts
      const filtered = recentPosts
        .filter(post => post.id !== currentPost.id)
        .slice(0, limit);
      
      setRelatedPosts(filtered);
      setIsLoading(false);
    }
  }, [recentPosts, currentPost, limit]);

  if (isLoading || postsLoading) {
    return <RelatedArticlesSkeleton className={className} />;
  }

  if (!relatedPosts.length) {
    return null;
  }

  return (
    <section className={`${className}`}>
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-medium-text-primary mb-2">
          More from {currentPost.user?.name || 'this author'}
        </h2>
        <p className="text-medium-text-secondary">
          Discover more articles you might enjoy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map(post => (
          <RelatedArticleCard key={post.id} post={post} />
        ))}
      </div>

      {/* See More Link */}
      {currentPost.user && (
        <div className="text-center mt-8">
          <Link
            href={`/${currentPost.user.username}`}
            className="inline-flex items-center px-6 py-3 bg-medium-bg-secondary text-medium-text-primary hover:bg-medium-hover rounded-button transition-colors"
          >
            See all from {currentPost.user.name}
          </Link>
        </div>
      )}
    </section>
  );
};

// Individual related article card
const RelatedArticleCard = ({ post }) => {
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.split(' ').length : 0;
    return Math.ceil(words / wordsPerMinute);
  };

  const readingTime = calculateReadingTime(post.content);

  return (
    <Card className="group hover:shadow-card-hover transition-all duration-200" padding="none">
      <Link href={`/p/${post.title_name}`} className="block">
        <article className="p-6">
          {/* Featured Image */}
          {post.image_title && (
            <div className="mb-4 -mx-6 -mt-6">
              <img
                src={post.image_title}
                alt={post.title}
                className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
              />
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center mb-3">
            <Avatar
              src={post.user?.avatar_url}
              name={post.user?.name}
              size="xs"
              className="mr-2"
            />
            <div className="text-sm text-medium-text-muted">
              <span className="font-medium">{post.user?.name}</span>
              <span className="mx-1">•</span>
              <TimeAgo timestamp={post.created_at} />
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-lg text-medium-text-primary group-hover:text-medium-accent-green transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-medium-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
            {post.preview_content || post.content?.substring(0, 150) + '...'}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-medium-text-muted">
            <span>{readingTime} min read</span>
            <div className="flex items-center space-x-3">
              <span>👏 {post.claps_count || 0}</span>
              <span>💬 {post.comments_count || 0}</span>
            </div>
          </div>
        </article>
      </Link>
    </Card>
  );
};

// Loading skeleton
const RelatedArticlesSkeleton = ({ className = '' }) => (
  <section className={`animate-pulse ${className}`}>
    <div className="mb-8">
      <div className="h-8 bg-medium-bg-secondary rounded w-64 mb-2"></div>
      <div className="h-4 bg-medium-bg-secondary rounded w-48"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="h-48 bg-medium-bg-secondary rounded-lg mb-4"></div>
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-medium-bg-secondary rounded-full mr-2"></div>
            <div className="h-3 bg-medium-bg-secondary rounded w-32"></div>
          </div>
          <div className="h-6 bg-medium-bg-secondary rounded w-full mb-2"></div>
          <div className="h-6 bg-medium-bg-secondary rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-medium-bg-secondary rounded w-full mb-2"></div>
          <div className="h-4 bg-medium-bg-secondary rounded w-2/3 mb-4"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-medium-bg-secondary rounded w-16"></div>
            <div className="h-3 bg-medium-bg-secondary rounded w-24"></div>
          </div>
        </Card>
      ))}
    </div>
  </section>
);

// Compact related articles for sidebar
export const CompactRelatedArticles = ({ currentPost, limit = 3, className = '' }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const { posts: recentPosts, isLoading } = useRecentPosts(10);

  useEffect(() => {
    if (recentPosts && currentPost) {
      const filtered = recentPosts
        .filter(post => post.id !== currentPost.id)
        .slice(0, limit);
      setRelatedPosts(filtered);
    }
  }, [recentPosts, currentPost, limit]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-medium-bg-secondary rounded w-full mb-2"></div>
            <div className="h-3 bg-medium-bg-secondary rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!relatedPosts.length) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-serif font-bold text-lg text-medium-text-primary mb-4">
        Related Articles
      </h3>
      
      {relatedPosts.map(post => (
        <CompactRelatedItem key={post.id} post={post} />
      ))}
    </div>
  );
};

// Compact related article item
const CompactRelatedItem = ({ post }) => (
  <Link href={`/p/${post.title_name}`} className="block group">
    <article className="pb-4 border-b border-medium-divider last:border-b-0 last:pb-0">
      <h4 className="font-serif font-medium text-medium-text-primary group-hover:text-medium-accent-green transition-colors line-clamp-2 mb-2">
        {post.title}
      </h4>
      <div className="flex items-center text-xs text-medium-text-muted space-x-2">
        <span>{post.user?.name}</span>
        <span>•</span>
        <TimeAgo timestamp={post.created_at} />
        <span>•</span>
        <span>👏 {post.claps_count || 0}</span>
      </div>
    </article>
  </Link>
);

// Hook for getting related articles
export const useRelatedArticles = (currentPost, options = {}) => {
  const { limit = 4, algorithm = 'recent' } = options;
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!currentPost) return;

      setIsLoading(true);
      
      try {
        // TODO: Implement different algorithms
        switch (algorithm) {
          case 'tags':
            // Find articles with similar tags
            break;
          case 'author':
            // Find more articles from same author
            break;
          case 'category':
            // Find articles in same category
            break;
          case 'recent':
          default:
            // Use recent posts for now
            const { posts } = await import('../../hooks/useRecentPosts');
            // This is a simplified version - in real implementation,
            // you'd call the API directly here
            break;
        }
        
        // For now, return empty array
        setRelatedPosts([]);
        
      } catch (error) {
        console.error('Failed to fetch related articles:', error);
        setRelatedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [currentPost, limit, algorithm]);

  return { relatedPosts, isLoading };
};

export default RelatedArticles;
