// hooks/useInfiniteBookmarks.js
import useSWRInfinite from 'swr/infinite';
import { getReadingList } from '../services/bookmarkService';

export const useInfiniteBookmarks = () => {
  const PAGE_SIZE = 10; // Số lượng bookmark mỗi trang

  const fetcher = async (page, limit) => {
    const data = await getReadingList(page, limit);
    return data;
  };

  const getKey = (pageIndex, previousPageData) => {
    // Nếu là page đầu tiên, luôn lấy dữ liệu
    if (pageIndex === 0) return [pageIndex + 1, PAGE_SIZE];

    // Nếu previousPageData không tồn tại hoặc không có posts, dừng fetching
    if (!previousPageData || previousPageData.posts?.length === 0) {
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
  const isEmpty = data?.[0]?.posts?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.posts?.length < PAGE_SIZE);

  const bookmarks = data
    ? data
        .map(page => page.posts || [])
        .flat()
        .filter((bookmark, index, self) => self.findIndex(b => b.id === bookmark.id) === index)
    : [];
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  return {
    bookmarks,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    totalCount,
  };
};

export default useInfiniteBookmarks;
