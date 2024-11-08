// hooks/useInfiniteScroll.js
import useSWRInfinite from 'swr/infinite';

/**
 * Hook để lấy dữ liệu với Infinite Scrolling
 * @param {Function} fetcher - Hàm để lấy dữ liệu, nhận các tham số (page, limit)
 * @param {number} pageSize - Số lượng item mỗi trang
 */
export const useInfiniteScroll = (fetcher, pageSize = 10) => {
  const getKey = (pageIndex, previousPageData) => {
    // Nếu đã không còn dữ liệu để tải thêm, trả về null
    if (previousPageData && previousPageData.length < pageSize) return null;

    // Trả về số trang và giới hạn
    return [pageIndex + 1, pageSize];
  };

  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([page, limit]) => fetcher(page, limit)
  );

  // Các trạng thái loading và error
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.length < pageSize);

  // Kết hợp tất cả các trang thành một mảng duy nhất
  const items = data ? data.flat() : [];
  const totalCount = items.length;

  return {
    items,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    totalCount,
  };
};
