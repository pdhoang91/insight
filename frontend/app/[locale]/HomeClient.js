'use client';

import React from 'react';
import Link from 'next/link';
import { useInfinitePosts } from '../../hooks/useInfinitePosts';
import { HomeLayout } from '../../components/Layout/Layout';
import PostList from '../../components/Post/PostList';
import PersonalBlogSidebar from '../../components/Sidebar/PersonalBlogSidebar';
import TimeAgo from '../../components/Utils/TimeAgo';
import TextUtils from '../../components/Utils/TextUtils';

const FeaturedPost = ({ post }) => {
  if (!post) return null;

  return (
    <Link href={`/p/${post.slug}`} className="block group mb-8">
      <article className="bg-white rounded-lg border border-medium-border overflow-hidden">
        {post.cover_image && (
          <div className="aspect-[21/9] overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 bg-medium-accent-green/10 text-medium-accent-green text-xs font-medium rounded-full">
              Featured
            </span>
            <TimeAgo timestamp={post.created_at} className="text-xs text-medium-text-muted" />
          </div>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-medium-text-primary group-hover:text-medium-accent-green transition-colors line-clamp-2 mb-2">
            {post.title}
          </h2>
          <p className="text-medium-text-secondary text-base line-clamp-2 leading-relaxed">
            <TextUtils html={post.excerpt} maxLength={250} />
          </p>
        </div>
      </article>
    </Link>
  );
};

export default function HomeClient({ initialPosts, totalCount }) {
  const { posts, isLoading, isError, setSize, isReachingEnd } =
    useInfinitePosts();

  const flatPosts = posts?.flat().filter(Boolean) || [];
  const featuredPost = flatPosts[0];
  const remainingPosts = flatPosts.slice(1);

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      {!isLoading && featuredPost && <FeaturedPost post={featuredPost} />}
      <PostList
        posts={remainingPosts.length > 0 ? [remainingPosts] : posts}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
        skipFirst={!!featuredPost && !isLoading}
      />
    </HomeLayout>
  );
}
