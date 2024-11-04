// pages/category/index.js
import React from 'react';
import Sidebar from '../../components/Shared/Sidebar'; // Nếu bạn muốn có sidebar
import CategoryList from '../../components/Category/CategoryList';

const CategoryPage = () => {
  return (
    <div className="flex">
      <div className="w-1/12 p-4 h-screen sticky top-0 overflow-auto">
        <Sidebar />
      </div>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4 center-parent">Categories</h1>
          <CategoryList />
      </div>
    </div>
  );
};

export default CategoryPage;
