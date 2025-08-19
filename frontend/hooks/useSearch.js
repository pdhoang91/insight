// hooks/useSearch.js
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { fetchStories, fetchSearchSuggestions, fetchPopularSearches } from '../services/searchService';

export const useSearch = (query) => {
  const PAGE_SIZE = 10;

  // Tạo hàm getKey cho useSWRInfinite
  const getKey = (pageIndex, previousPageData) => {
    if (!query) return null; // Không fetch nếu không có query
    if (previousPageData && previousPageData.posts && previousPageData.posts.length < PAGE_SIZE) {
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

  const posts = swrData ? swrData.flatMap((page) => page?.posts || []) : [];
  const totalCount = swrData && swrData.length > 0 && swrData[0] ? swrData[0].totalCount || 0 : 0;
  
  // Fixed logic: check if we have more pages to load
  const hasMore = swrData && swrData.length > 0 && posts.length > 0
    ? posts.length < totalCount
    : false;

  const loadMore = () => {
    if (hasMore && !isValidating) {
      setSize(size + 1);
    }
  };

  return {
    data: { stories: posts }, // Maintain compatibility with existing code
    totalCount,
    isLoading: !swrData && !error,
    isValidating,
    isError: error,
    loadMore,
    hasMore,
  };
};

// Hook for search suggestions
export const useSearchSuggestions = (query) => {
  const { data, error, mutate } = useSWR(
    query ? `/search/suggestions?q=${encodeURIComponent(query)}` : null,
    () => fetchSearchSuggestions(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300, // 300ms debounce
    }
  );

  return {
    suggestions: data?.suggestions || [],
    isLoading: !data && !error,
    isError: error,
    refresh: mutate,
  };
};

// Hook for popular searches
export const usePopularSearches = () => {
  const { data, error, mutate } = useSWR(
    '/search/popular',
    () => fetchPopularSearches(),
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    searches: data?.popular_searches || [],
    isLoading: !data && !error,
    isError: error,
    refresh: mutate,
  };
};
