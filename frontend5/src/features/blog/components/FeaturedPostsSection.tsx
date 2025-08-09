'use client';

import React from 'react';
import { useFeaturedPosts } from '@/hooks/usePosts';
import BlogCard from './BlogCard';
import { LoadingSpinner } from '@/components/ui';

const FeaturedPostsSection: React.FC = () => {
  const { posts, isLoading, error } = useFeaturedPosts();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load featured posts</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No featured posts available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Main featured post */}
      <div className="lg:col-span-1">
        <BlogCard
          post={posts[0]}
          variant="featured"
        />
      </div>
      
      {/* Secondary featured posts */}
      <div className="lg:col-span-1 space-y-6">
        {posts.slice(1, 3).map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedPostsSection; 