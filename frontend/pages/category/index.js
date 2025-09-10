// pages/category/index.js
import React from 'react';
import { PageLayout } from '../../components/Layout';
import { CategoryList } from '../../components/Category';

const CategoryPage = () => {
  return (
    <PageLayout 
      title="Danh mục"
      description="Khám phá bài viết theo danh mục"
    >
      <CategoryList />
    </PageLayout>
  );
};

export default CategoryPage;
