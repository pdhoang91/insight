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
    return <div>Loading...</div>;
  }

  const {
    posts,
    totalCount,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePostByCategory(name); // Loại bỏ 'user' nếu không cần thiết

  return (
    <div className="flex">
      <div className="w-1/12 p-4 h-screen sticky top-0 overflow-auto">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <Breadcrumbs />
        <div className="flex-1 p-4">
          <h1 className="text-3xl font-bold mb-4 center-parent">{name}</h1>
          <CategoryListWithPosts
            posts={posts}
            isLoading={isLoading}
            isError={isError}
            setSize={setSize}
            isReachingEnd={isReachingEnd}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
