// hooks/useInfiniteComments.js
import useSWRInfinite from 'swr/infinite';
import { getCommentsForPost } from '../services/commentService';

export const useInfiniteComments = (postId, isEnabled = true, pageSize = 5) => {
  const getKey = (pageIndex, previousPageData) => {
    if (!isEnabled || !postId) return null;

    // First page — no cursor
    if (pageIndex === 0) return `/posts/${postId}/comments?limit=${pageSize}`;

    // Stop when previous page has no next cursor
    if (!previousPageData || previousPageData.nextCursor === null) return null;

    return `/posts/${postId}/comments?cursor=${previousPageData.nextCursor}&limit=${pageSize}`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(
    getKey,
    (key) => {
      const url = new URL(key, 'http://localhost');
      const cursor = url.searchParams.get('cursor');
      const limit = parseInt(url.searchParams.get('limit') || String(pageSize));
      return getCommentsForPost(postId, cursor, limit);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 15000,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  );

  const isLoadingMore = !data && !error || (size > 0 && data && typeof data[size - 1] === 'undefined');

  const comments = data
    ? (() => {
        const seen = new Set();
        return data.flatMap(page => page.data || []).filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      })()
    : [];

  // Can load more if the last page returned a next_cursor
  const canLoadMore = data && data.length > 0 && data[data.length - 1]?.nextCursor !== null;

  // Total count from the first page
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  const loadMore = () => {
    if (canLoadMore && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  return {
    comments,
    totalCount,
    isLoading: isLoadingMore,
    isError: error,
    canLoadMore,
    loadMore,
    mutate,
  };
};
