// pages/category/index.js
import React from 'react';
import Sidebar from '../../components/Shared/Sidebar'; // Nếu bạn muốn có sidebar
import CategoryList from '../../components/Category/CategoryList';

const CategoryPage = () => {
  return (
    <div className="flex flex-col lg:flex-row">
      <div className="lg:w-1/12 p-4 h-screen sticky top-0 overflow-auto hidden lg:block">
        <Sidebar />
      </div>
      <div className="lg:w-10/12 p-4">
        <h1 className="text-3xl font-bold mb-4 center-parent">Categories</h1>
          <CategoryList />
      </div>
      <div className="lg:w-1/12 p-8 hidden lg:block">
        {/* <ProfileRightSidebar currentUser={loggedUser} viewedUsername={viewedUsername} /> */}
      </div>
    </div>
  );
};

export default CategoryPage;
