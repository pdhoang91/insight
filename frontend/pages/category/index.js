// pages/category/index.js
import React from 'react';
import CategoryList from '../../components/Category/CategoryList';

const CategoryPage = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <main className="content-area">
          <header className="page-header">
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle tech-comment">explore stories by category</p>
          </header>
          
          <CategoryList />
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;
