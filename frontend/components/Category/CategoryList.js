// components/Category/CategoryList.js
import React from 'react';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
import CategoryItem from './CategoryItem';
import { useInfiniteCategories } from '../../hooks/useInfiniteCategories';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const CategoryList = () => {
  const {
    categories,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
    totalCount,
  } = useInfiniteCategories();

  const fetchMore = () => {
    if (!isReachingEnd && !isLoading) {
      setSize(prevSize => prevSize + 1);
    }
  };

  const renderItem = (category) => {
    if (!category || !category.id) {
      console.warn('Category without id:', category);
      return null;
    }
    return <CategoryItem key={category.id} category={category} />;
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-3 py-6 border border-danger/20 rounded-lg bg-danger/5">
          <FaExclamationTriangle className="w-6 h-6 text-danger" />
          <div>
            <p className="font-mono text-danger font-semibold">// Không thể tải danh mục</p>
            <p className="text-muted text-sm mt-1">Vui lòng kiểm tra kết nối và thử lại</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InfiniteScrollWrapper
      items={categories}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center gap-3 rounded-lg bg-elevated">
            <FaSpinner className="animate-spin text-primary w-5 h-5" />
            <span className="text-secondary font-mono">Đang tải danh mục...</span>
          </div>
        </div>
      }
      endMessage={
        <div className="text-center py-8">
          <p className="text-muted font-mono">// Đã tải tất cả danh mục</p>
          {totalCount > 0 && (
            <p className="text-xs text-muted mt-2">Tổng cộng: {totalCount} danh mục</p>
          )}
        </div>
      }
      className="space-y-8"
    />
  );
};

export default CategoryList;