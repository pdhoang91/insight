// pages/category/[name].js
import React from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Shared/Sidebar';
import Breadcrumbs from '../../components/Shared/Breadcrumbs'; // Đường dẫn đã sửa
import CategoryListWithPosts from '../../components/Category/CategoryListWithPosts'; // Đường dẫn đã sửa
import { useInfinitePostByCategory } from '../../hooks/useInfinitePostByCategory';
import { useUser } from '../../context/UserContext'; // Nếu bạn sử dụng context để lấy user

const CategoryPage = () => {
  const router = useRouter();
  const { name } = router.query; // Lấy tên category từ URL

  // Lấy thông tin người dùng nếu cần thiết
  const { user } = useUser(); // Đảm bảo rằng bạn đã thiết lập UserContext

  if (!name) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-secondary">Loading category...</div>
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
    <div className="min-h-screen bg-app">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="bg-surface rounded-xl p-8">
          <header className="mb-8 pb-6 border-b border-border-primary">
            <h1 className="text-4xl font-bold text-primary mb-4 line-height-tight">{name}</h1>
            <p className="text-secondary font-mono text-sm">posts in this category</p>
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
    </div>
  );
};

export default CategoryPage;
