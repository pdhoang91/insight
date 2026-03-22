// hooks/useSearch.js
import { fetchStories } from '../services/searchService';
import { useInfiniteList } from './useInfiniteList';

export const useSearch = (query) => {
  const {
    posts,
    totalCount,
    isLoading,
    isError,
    hasMore,
    size,
    setSize,
    isValidating,
  } = useInfiniteList({
    // Include query in key so different queries have separate SWR cache entries
    key: ['search', query],
    fetcher: (page, limit) => fetchStories(query, page, limit),
    enabled: !!query,
  });

  const loadMore = () => {
    if (hasMore && !isValidating) setSize(size + 1);
  };

  return {
    data: { stories: posts }, // backward-compatible shape
    totalCount,
    isLoading,
    isValidating,
    isError,
    loadMore,
    hasMore,
  };
};
