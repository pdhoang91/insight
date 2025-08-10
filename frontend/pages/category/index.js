// pages/category/index.js
import React from 'react';
import BlogSidebar from '../../components/Shared/BlogSidebar';
import CategoryList from '../../components/Category/CategoryList';

const CategoryPage = () => {
  return (
    <div className="min-h-screen bg-terminal-black">
      {/* Main Content */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-terminal-gray rounded-lg p-6 md:p-8 border border-matrix-green/30">
                <header className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-matrix-green/20">
                  <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 md:mb-4">
                    Categories
                  </h1>
                  <p className="text-text-secondary text-sm md:text-base">
                    Explore stories by category
                  </p>
                </header>
              
                <CategoryList />
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
