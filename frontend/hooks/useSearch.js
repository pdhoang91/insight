// hooks/useSearch.js
import useSWRInfinite from 'swr/infinite';
import { fetchStories } from '../services/searchService';

export const useSearch = (query) => {
  const PAGE_SIZE = 10;

  // Tạo hàm getKey cho useSWRInfinite
  const getKey = (pageIndex, previousPageData) => {
    if (!query) return null; // Không fetch nếu không có query
    if (previousPageData && previousPageData.posts.length < PAGE_SIZE) {
      return null; // Ngừng fetch nếu đã tải hết
    }
    return { page: pageIndex + 1, limit: PAGE_SIZE };
  };

  const fetcher = async ({ page, limit }) => {
    try {
      const data = await fetchStories(query, page, limit);
      return { posts: data.posts, totalCount: data.totalCount };
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  };

  // Khởi tạo useSWRInfinite cho stories
  const { data: swrData, error, setSize, size, isValidating } = useSWRInfinite(
    getKey,
    fetcher
  );

  const posts = swrData ? swrData.flatMap((page) => page.posts) : [];
  const hasMore = swrData && swrData.length > 0
    ? swrData.some((page) => page.posts?.length === PAGE_SIZE)
    : false;

  const loadMore = () => {
    if (!hasMore && !isValidating) {
      setSize(size + 1);
    }
  };

  return {
    data: { stories: posts }, // Maintain compatibility with existing code
    isLoading: isValidating,
    isError: error,
    loadMore,
    hasMore,
  };
};
