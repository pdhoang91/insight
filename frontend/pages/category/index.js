// pages/category/index.js
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
  },
});

export default CategoryPage;
