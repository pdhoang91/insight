'use client';

import React from 'react';
import { HomeLayout } from '../../../../components/Layout/Layout';
import { CategoryPosts } from '../../../../components/Category';
import { useInfinitePostByCategory } from '../../../../hooks/useInfinitePostByCategory';
import LoadingSpinner from '../../../../components/Shared/LoadingSpinner';
import PersonalBlogSidebar from '../../../../components/Sidebar/PersonalBlogSidebar';

export default function CategoryPostsClient({ name }) {
  const decodedName = decodeURIComponent(name);

  const { posts, totalCount, isLoading, isError, setSize, isReachingEnd } = useInfinitePostByCategory(decodedName);

  if (!decodedName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[#757575] text-sm">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <CategoryPosts
        categoryName={decodedName}
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </HomeLayout>
  );
}
