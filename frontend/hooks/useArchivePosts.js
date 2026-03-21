// hooks/useArchivePosts.js
import useSWRInfinite from 'swr/infinite';
import { getPostsByYearMonth } from '../services/postService';

const PAGE_SIZE = 20;

export const useArchivePosts = (year, month) => {
  const getKey = (pageIndex, previousPageData) => {
    if (!year || !month) return null;
    // Stop fetching when the last page returned fewer posts than PAGE_SIZE
    if (previousPageData && previousPageData.posts.length < PAGE_SIZE) return null;
    return { year, month, page: pageIndex + 1, limit: PAGE_SIZE };
  };

  const fetcher = ({ year, month, page, limit }) =>
    getPostsByYearMonth(year, month, page, limit);

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const posts = data ? data.flatMap((d) => d.posts) : [];
  const totalCount = data?.[0]?.totalCount || 0;
  const isLoading = !data && !error;
  const hasMore = data ? posts.length < totalCount : false;

  return {
    posts,
    totalCount,
    isLoading,
    isError: error,
    hasMore,
    size,
    setSize,
    isValidating,
  };
};

export default useArchivePosts;
