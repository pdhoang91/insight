// hooks/useInfiniteFollows.js
import useSWRInfinite from 'swr/infinite';
import { getUserFollows } from '../services/userService';

export const useInfiniteFollows = (username) => {
  const PAGE_SIZE = 10; // Số lượng người theo dõi mỗi trang

  const fetcher = async (page, limit) => {
    const data = await getUserFollows(username, page, limit);
    return data;
  };

  const getKey = (pageIndex, previousPageData) => {
    // Nếu chưa có username hoặc đã không còn dữ liệu để tải thêm, trả về null
    if (!username) return null;
    if (previousPageData && previousPageData.peoples.length === 0) return null;

    // Trả về key cho trang tiếp theo
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
  const isEmpty = data?.[0]?.peoples?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.peoples?.length < PAGE_SIZE);

  const follows = data
    ? data
        .map(page => page.peoples || [])
        .flat()
        .filter((person, index, self) => self.findIndex(p => p.id === person.id) === index)
    : [];

  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  return {
    follows,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    totalCount,
  };
};

export default useInfiniteFollows;
