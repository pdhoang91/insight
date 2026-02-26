// components/Post/PopularPosts.js
import React from 'react';
import Link from 'next/link';
import { usePopularPosts, useRecentPosts } from '../../hooks/useRecentPosts';
import TimeAgo from '../Utils/TimeAgo';

const PopularPosts = ({ limit = 5, showImages = false, className = '' }) => {
  const { posts: popularPosts, isLoading, isError } = usePopularPosts(limit);
  const { posts: recentPosts } = useRecentPosts(limit);

  const displayPosts = isError ? recentPosts : popularPosts;

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-3/4 bg-[#f2f2f2] rounded animate-pulse" />
              <div className="h-3 w-16 bg-[#f2f2f2] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayPosts?.length) {
    return (
      <div className={className}>
        <p className="text-[13px] text-[#b3b3b1]">No popular posts yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-0">
        {displayPosts.slice(0, limit).map((post) => (
          <article key={post.id} className="py-2 border-b border-[#f2f2f2] last:border-0">
            <Link href={`/p/${post.slug}`} className="block group">
              <h4 className="text-[13px] font-medium text-[#292929] group-hover:underline line-clamp-2 leading-snug">
                {post.title}
              </h4>
              <div className="text-[11px] text-[#b3b3b1] mt-1">
                <TimeAgo timestamp={post.created_at} />
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default PopularPosts;
