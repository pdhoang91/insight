// // components/Category/CategoryListWithInfiniteScroll.js
// import React from 'react';
// import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
// import CategoryItem from './CategoryItem'; // Component để hiển thị một danh mục
// import { useInfiniteCategories } from '../../hooks/useInfiniteCategories';

// const CategoryListWithInfiniteScroll = () => {
//   const {
//     categories,
//     isLoading,
//     isError,
//     setSize,
//     isReachingEnd,
//     totalCount,
//   } = useInfiniteCategories();

//   const fetchMore = () => {
//     if (!isReachingEnd && !isLoading) {
//       setSize(prevSize => prevSize + 1);
//     }
//   };

//   const renderItem = (category) => {
//     if (!category || !category.id) {
//       console.warn('Category without id:', category);
//       return null;
//     }
//     return <CategoryItem key={category.id} category={category} />;
//   };

//   if (isError) return <div className="text-red-500">Failed to load categories</div>;
//   if (isLoading && categories.length === 0) return <div>Loading...</div>;

//   return (
//     <InfiniteScrollWrapper
//       items={categories}
//       renderItem={renderItem}
//       fetchMore={fetchMore}
//       hasMore={!isReachingEnd}
//       loader={<div>Loading...</div>}
//       endMessage={<p className="text-center"></p>}
//       className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
//     />
//   );
// };

// export default CategoryListWithInfiniteScroll;


// src/components/Category/CategoryListWithInfiniteScroll.js
import React from 'react';
import InfiniteScrollWrapper from '../Utils/InfiniteScrollWrapper';
import CategoryItem from './CategoryItem';
import { useInfiniteCategories } from '../../hooks/useInfiniteCategories';
import { FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CategoryListWithInfiniteScroll = () => {
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

  if (isError)
    return (
      <div className="text-red-500 text-center">
        <p>Không thể tải danh mục. Vui lòng thử lại sau.</p>
      </div>
    );

  return (
    <InfiniteScrollWrapper
      items={categories}
      renderItem={renderItem}
      fetchMore={fetchMore}
      hasMore={!isReachingEnd}
      loader={
        <div className="flex justify-center items-center my-4">
          <FaSpinner className="animate-spin text-gray-500 mr-2" />
          <span className="text-gray-500">Đang tải...</span>
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

export default CategoryListWithInfiniteScroll;
