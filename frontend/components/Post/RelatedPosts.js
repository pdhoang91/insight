// components/Post/RelatedPosts.js
import React from 'react';
import Link from 'next/link';
import BasePostItem from './BasePostItem';

const RelatedPosts = ({ posts = [], currentPostId, className = '' }) => {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div className={`bg-white rounded-lg border border-medium-border p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-bold text-medium-text-primary">Related Articles</h3>
        <Link
          href="/search"
          className="text-sm text-medium-accent-green hover:text-medium-accent-green/80 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-medium-border">
        {relatedPosts.map(post => (
          <BasePostItem key={post.id} post={post} variant="horizontal" showComments={false} />
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
