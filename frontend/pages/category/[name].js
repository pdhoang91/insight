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
      <div className="loading-container">
        <div className="loading-card animate-pulse">
          Loading category...
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
    <div className="page-container">
      <div className="page-content">
        <main className="content-area">
          <header className="page-header">
            <h1 className="page-title">{name}</h1>
            <p className="page-subtitle tech-comment">posts in this category</p>
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
