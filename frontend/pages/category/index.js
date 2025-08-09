// pages/category/index.js
import React from 'react';
import CategoryList from '../../components/Category/CategoryList';

const CategoryPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Categories</h1>
          <p className="mt-2 text-lg text-gray-600 text-center">Explore stories by category</p>
        </div>
        <CategoryList />
      </div>
    </div>
  );
};

export default CategoryPage;
