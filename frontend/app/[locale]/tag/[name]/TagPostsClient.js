'use client';

import React from 'react';
import { HomeLayout } from '../../../../components/Layout/Layout';
import TagPosts from '../../../../components/Tag/TagPosts';
import { useInfinitePostByTag } from '../../../../hooks/useInfinitePostByTag';
import PersonalBlogSidebar from '../../../../components/Sidebar/PersonalBlogSidebar';

export default function TagPostsClient({ name }) {
  const decodedName = decodeURIComponent(name);

  const { posts, totalCount, isLoading, isError, setSize, isReachingEnd } =
    useInfinitePostByTag(decodedName);

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <TagPosts
        tagName={decodedName}
        posts={posts}
        totalCount={totalCount}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </HomeLayout>
  );
}
