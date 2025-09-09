// pages/category/[name].js
import React from 'react';
import { useRouter } from 'next/router';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import Layout from '../../components/Layout/Layout';
import { CategoryPosts } from '../../components/Category';
import { useInfinitePostByCategory } from '../../hooks/useInfinitePostByCategory';
import { LoadingSpinner } from '../../components/UI';

const CategoryPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const { classes } = useThemeClasses();

  if (!name) {
    return (
      <div className={classes.pageLoading}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${classes.text.secondary}`}>Đang tải danh mục...</p>
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
    <Layout showSidebar={false}>
      <CategoryPosts
        categoryName={name}
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
    </Layout>
  );
};

export default CategoryPage;
