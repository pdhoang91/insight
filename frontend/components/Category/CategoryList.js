// components/Category/CategoryList.js
import React from 'react';
import Link from 'next/link';
import { useCategories } from '../../hooks/useCategories';
import { LoadingScreen } from '../UI';

const CategoryList = () => {
  const { categories, isLoading, isError } = useCategories();

  if (isLoading) {
    return <LoadingScreen message="Đang tải danh mục..." />;
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-medium-text-secondary">Không thể tải danh mục</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-medium-text-secondary">Không tìm thấy danh mục nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.name.toLowerCase()}`}
          className="bg-medium-bg-card rounded-xl border border-medium-border p-6 hover:shadow-lg hover:border-medium-accent-green/20 transition-all duration-200 group"
        >
          <h3 className="text-lg font-serif font-bold text-medium-text-primary group-hover:text-medium-accent-green transition-colors mb-2">
            {category.name}
          </h3>
          <p className="text-medium-text-secondary text-sm mb-4">
            {category.description || 'Khám phá các bài viết trong danh mục này'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-medium-text-muted">
              {category.post_count || 0} bài viết
            </span>
            <span className="text-medium-accent-green opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
