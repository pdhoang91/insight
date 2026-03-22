'use client';

import React from 'react';
import { HomeLayout } from '../../../../components/Layout/Layout';
import { CategoryPosts } from '../../../../components/Category';
import { useInfinitePostByCategory } from '../../../../hooks/useInfinitePostByCategory';
import PersonalBlogSidebar from '../../../../components/Sidebar/PersonalBlogSidebar';

export default function CategoryPostsClient({ name }) {
  const decodedName = decodeURIComponent(name);

  const { posts, totalCount, isLoading, isError, setSize, isReachingEnd } = useInfinitePostByCategory(decodedName);

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <CategoryPosts
        categoryName={decodedName}
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
