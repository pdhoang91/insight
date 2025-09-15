// pages/category/[name].js
import React from 'react';
import { useRouter } from 'next/router';
import { HomeLayout } from '../../components/Layout/Layout';
import { CategoryPosts } from '../../components/Category';
import { useInfinitePostByCategory } from '../../hooks/useInfinitePostByCategory';
import { LoadingSpinner } from '../../components/ui';
import PersonalBlogSidebar from '../../components/Sidebar/PersonalBlogSidebar';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const CategoryPage = () => {
  const router = useRouter();
  const { name } = router.query;

  if (!name) {
    return (
      <div className={componentClasses.pageLoading}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${themeClasses.text.secondary}`}>Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  const {
    posts,
    totalCount,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePostByCategory(name);

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <CategoryPosts
        categoryName={name}
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </HomeLayout>
  );
};

export default CategoryPage;
