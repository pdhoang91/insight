// src/components/Category/CategoryList.js
import React from 'react';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
import CategoryItem from './CategoryItem';
import { useInfiniteCategories } from '../../hooks/useInfiniteCategories';
import { FaSpinner } from 'react-icons/fa';

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
      <div className="text-red-600 text-center">
        <p className="font-mono">// Unable to load categories</p>
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
        <div className="flex justify-center items-center my-4">
          <FaSpinner className="animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600 font-mono">Loading categories...</span>
        </div>
      }
      endMessage={
        <p className="text-center mt-4">
          {/* Đã tải hết danh mục ({totalCount}) */}
        </p>
      }
      className="grid grid-cols-1 sm:grid-cols-2 gap-6"
    />
  );
};

export default CategoryList;