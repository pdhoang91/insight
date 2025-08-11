// pages/category/[name].js
import React from 'react';
import { useRouter } from 'next/router';
import BlogSidebar from '../../components/Shared/BlogSidebar';
import CategoryListWithPosts from '../../components/Category/CategoryListWithPosts';
import { useInfinitePostByCategory } from '../../hooks/useInfinitePostByCategory';
import { LoadingSpinner } from '../../components/UI';

const CategoryPage = () => {
  const router = useRouter();
  const { name } = router.query;

  if (!name) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading category...</p>
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
    <div className="min-h-screen bg-terminal-black">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="p-6 md:p-8">
                <header className="mb-2 md:mb-4 pb-4 md:pb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 md:mb-4 capitalize">
                    {name}
                  </h1>
                </header>
              
                <CategoryListWithPosts
                  posts={posts}
                  isLoading={isLoading}
                  isError={isError}
                  setSize={setSize}
                  isReachingEnd={isReachingEnd}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BlogSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
