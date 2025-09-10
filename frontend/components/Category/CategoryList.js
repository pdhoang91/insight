// components/Category/CategoryList.js
import React from 'react';
import Link from 'next/link';
import { useCategories } from '../../hooks/useCategories';
import { LoadingScreen } from '../UI';

const CategoryList = () => {
  const { categories, isLoading, isError } = useCategories();

  if (isLoading) {
    return <LoadingScreen message="Loading categories..." />;
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-medium-text-secondary">Failed to load categories</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-medium-text-secondary">No categories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.name.toLowerCase()}`}
          className="bg-medium-bg-card rounded-card border border-medium-border p-6 hover:shadow-card-hover transition-all group"
        >
          <h3 className="text-lg font-serif font-bold text-medium-text-primary group-hover:text-medium-accent-green transition-colors mb-2">
            {category.name}
          </h3>
          <p className="text-medium-text-secondary text-sm mb-4">
            {category.description || 'Explore posts in this category'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-medium-text-muted">
              {category.post_count || 0} posts
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
