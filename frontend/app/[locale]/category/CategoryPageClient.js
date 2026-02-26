'use client';

import React from 'react';
import { PageLayout } from '../../../components/Layout';
import { CategoryList } from '../../../components/Category';

export default function CategoryPageClient({ initialCategories }) {
  return (
    <PageLayout
      title="Danh mục"
      description="Khám phá bài viết theo danh mục"
    >
      <CategoryList initialCategories={initialCategories} />
    </PageLayout>
  );
}
