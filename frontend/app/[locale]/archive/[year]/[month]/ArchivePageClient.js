'use client';

import React from 'react';
import { HomeLayout } from '../../../../../components/Layout/Layout';
import PersonalBlogSidebar from '../../../../../components/Sidebar/PersonalBlogSidebar';
import PostList from '../../../../../components/Post/PostList';
import { useArchivePosts } from '../../../../../hooks/useArchivePosts';
import LoadingSpinner from '../../../../../components/Shared/LoadingSpinner';

export default function ArchivePageClient({ year, month }) {
  const yearInt = parseInt(year);
  const monthInt = parseInt(month);

  const { posts, totalCount, isLoading, isError, hasMore, loadMore } = useArchivePosts(yearInt, monthInt);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[monthInt - 1];

  if (isNaN(yearInt) || isNaN(monthInt) || yearInt < 1900 || yearInt > 2100 || monthInt < 1 || monthInt > 12) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <div className="text-center py-12 text-[#757575]">
          <h3 className="text-lg font-medium mb-2">Invalid archive date</h3>
          <p>Please provide a valid year and month.</p>
        </div>
      </HomeLayout>
    );
  }

  if (!yearInt || !monthInt) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[#757575] text-sm">Loading archive...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <div className="text-center py-12 text-[#757575]">
          <h3 className="text-lg font-medium mb-2">Error loading archive</h3>
          <p>Could not load posts for this archive.</p>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <div className="space-y-8">
        <header>
          <h1 className="font-serif font-bold text-3xl text-[#292929] mb-2">
            Archive: {monthName} {yearInt}
          </h1>
          <p className="text-[#757575]">
            {totalCount > 0
              ? `${totalCount} post${totalCount === 1 ? '' : 's'} from ${monthName} ${yearInt}`
              : `No posts found for ${monthName} ${yearInt}`}
          </p>
        </header>

        <PostList
          posts={[posts]}
          isLoading={isLoading}
          isError={isError}
          setSize={loadMore}
          isReachingEnd={!hasMore}
          variant="archive"
          showImages={true}
          showExcerpts={true}
        />
      </div>
    </HomeLayout>
  );
}
