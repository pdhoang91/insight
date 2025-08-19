// hooks/useInfiniteCategories.js
import useSWRInfinite from 'swr/infinite';
import { getCategories } from '../services/categoryService';

export const useInfiniteCategories = () => {
  const PAGE_SIZE = 10;

  const fetcher = async (page, limit) => {
    const data = await getCategories(page, limit);
    return data;
  };

  const getKey = (pageIndex, previousPageData) => {
    // Nếu là page đầu tiên, luôn lấy dữ liệu
    if (pageIndex === 0) return [pageIndex + 1, PAGE_SIZE];
    
    // Nếu previousPageData không tồn tại hoặc không có categories, dừng fetching
    if (!previousPageData || previousPageData.categories?.length === 0) {
      return null;
    }
    
    return [pageIndex + 1, PAGE_SIZE];
  };

  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([page, limit]) => fetcher(page, limit)
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.categories?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.categories?.length < PAGE_SIZE);

  const categories = data
    ? data
        .map(page => page.categories || [])
        .flat()
        .filter((category, index, self) => self.findIndex(c => c.id === category.id) === index)
    : [];
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  return {
    categories,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    totalCount,
  };
};

