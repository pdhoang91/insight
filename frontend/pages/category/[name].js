// pages/category/[name].js
import React from 'react';
import { useRouter } from 'next/router';
import BlogSidebar from '../../components/Shared/BlogSidebar';
import CategoryListWithPosts from '../../components/Category/CategoryListWithPosts';
import { useInfinitePostByCategory } from '../../hooks/useInfinitePostByCategory';
import { useUser } from '../../context/UserContext';

const CategoryPage = () => {
  const router = useRouter();
  const { name } = router.query;
  const { user } = useUser();

  if (!name) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-gray-300">Loading category...</div>
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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
                         <main className="bg-gray-800 rounded-xl p-6 md:p-8">
                              <header className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-700">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-50 mb-3 md:mb-4 line-height-tight">
                    {name}
                  </h1>
                  <p className="text-gray-300 font-mono text-sm md:text-base">
                    posts in this category
                    {totalCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
                        {totalCount}
                      </span>
                    )}
                  </p>
                </header>
              
              <CategoryListWithPosts
                posts={posts}
                isLoading={isLoading}
                isError={isError}
                setSize={setSize}
                isReachingEnd={isReachingEnd}
              />
            </main>
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
  );
};

export default CategoryPage;
