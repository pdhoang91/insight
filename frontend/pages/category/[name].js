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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white text-gray-900 font-mono p-8 max-w-md w-full text-center">
          <div className="animate-pulse">Loading category...</div>
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
    <div className="min-h-screen bg-black">
      {/* Technical Terminal-style Layout */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Content Area - White on Black */}
        <main className="bg-white text-gray-900 min-h-[80vh] p-8">
          {/* Header Section */}
          <header className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 leading-tight">{name}</h1>
            <p className="text-gray-600 font-mono">// posts in this category</p>
          </header>
          
          {/* Posts List */}
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
