// pages/archive/[year]/[month].js
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { HomeLayout } from '../../../components/Layout/Layout';
import PersonalBlogSidebar from '../../../components/Sidebar/PersonalBlogSidebar';
import PostList from '../../../components/Post/PostList';
import { useArchivePosts } from '../../../hooks/useArchivePosts';
import { LoadingSpinner } from '../../../components/UI';
import { componentClasses } from '../../../utils/themeClasses';

const ArchivePage = () => {
  const router = useRouter();
  const { year, month } = router.query;

  // Parse year and month as integers
  const yearInt = parseInt(year);
  const monthInt = parseInt(month);

  const {
    posts,
    totalCount,
    isLoading,
    isError,
    hasMore,
    loadMore,
  } = useArchivePosts(yearInt, monthInt);

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[monthInt - 1];

  // Validate year and month
  if (!year || !month || isNaN(yearInt) || isNaN(monthInt) || 
      yearInt < 1900 || yearInt > 2100 || monthInt < 1 || monthInt > 12) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <div className="text-center py-12 text-medium-text-secondary">
          <h3 className="text-lg font-medium mb-2">Ngày lưu trữ không hợp lệ</h3>
          <p>Vui lòng cung cấp năm và tháng hợp lệ.</p>
        </div>
      </HomeLayout>
    );
  }

  if (!yearInt || !monthInt) {
    return (
      <div className={componentClasses.pageLoading}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Loading archive...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <div className="text-center py-12 text-medium-text-secondary">
          <h3 className="text-lg font-medium mb-2">Lỗi tải Archive</h3>
          <p>Không thể tải bài viết cho archive này.</p>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <div className="space-y-6 lg:space-y-8">
        {/* Archive Header */}
        <header className="text-center lg:text-left">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-medium-text-primary mb-3 lg:mb-4">
            Archive: {monthName} {yearInt}
          </h1>
          <p className="text-base sm:text-lg text-medium-text-secondary max-w-2xl mx-auto lg:mx-0">
            {totalCount > 0 
              ? `${totalCount} post${totalCount === 1 ? '' : 's'} from ${monthName} ${yearInt}`
              : `No posts found for ${monthName} ${yearInt}`
            }
          </p>
        </header>

        {/* Posts List */}
        <PostList
          posts={[posts]} // Wrap in array for compatibility with infinite scroll
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
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
  },
});

export default ArchivePage;
