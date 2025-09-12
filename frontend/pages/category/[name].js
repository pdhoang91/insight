// pages/category/[name].js
import React from 'react';
import { useRouter } from 'next/router';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { HomeLayout } from '../../components/Layout/Layout';
import { CategoryPosts } from '../../components/Category';
import { useInfinitePostByCategory } from '../../hooks/useInfinitePostByCategory';
import { LoadingSpinner } from '../../components/UI';
import PersonalBlogSidebar from '../../components/Sidebar/PersonalBlogSidebar';
import { componentClasses } from '../../utils/themeClasses';

const CategoryPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const { classes } = useThemeClasses();

  if (!name) {
    return (
      <div className={componentClasses.pageLoading}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Đang tải danh mục...</p>
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
