// hooks/useCommentReplies.js
import useSWRInfinite from 'swr/infinite';
import { getRepliesForComment } from '../services/commentService';

export const useCommentReplies = (commentId, isEnabled = false, pageSize = 10) => {
  const getKey = (pageIndex, previousPageData) => {
    if (!isEnabled || !commentId) return null;

    // First page — no cursor
    if (pageIndex === 0) return `/comments/${commentId}/replies?limit=${pageSize}`;

    // Stop when previous page has no next cursor
    if (!previousPageData || previousPageData.nextCursor === null) return null;

    return `/comments/${commentId}/replies?cursor=${previousPageData.nextCursor}&limit=${pageSize}`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(
    getKey,
    (key) => {
      const url = new URL(key, 'http://localhost');
      const cursor = url.searchParams.get('cursor');
      const limit = parseInt(url.searchParams.get('limit') || String(pageSize));
      return getRepliesForComment(commentId, cursor, limit);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000,
      errorRetryCount: 2,
    }
  );

  const isLoading = !data && !error || (size > 0 && data && typeof data[size - 1] === 'undefined');

  const replies = data ? data.flatMap(page => page.data || []) : [];

  const canLoadMore = data && data.length > 0 && data[data.length - 1]?.nextCursor !== null;

  const loadMore = () => {
    if (canLoadMore && !isLoading) setSize(size + 1);
  };

  return { replies, isLoading, isError: error, canLoadMore, loadMore, mutate };
};
