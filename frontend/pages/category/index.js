// pages/category/index.js
import React from 'react';
import CategoryList from '../../components/Category/CategoryList';

const CategoryPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Technical Terminal-style Layout */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Content Area - White on Black */}
        <main className="bg-white text-gray-900 min-h-[80vh] p-8">
          {/* Header Section */}
          <header className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 leading-tight">Categories</h1>
            <p className="text-gray-600 font-mono">// explore stories by category</p>
          </header>
          
          {/* Categories List */}
          <CategoryList />
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;
