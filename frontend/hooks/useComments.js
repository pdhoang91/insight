// hooks/useComments.js
import useSWR from 'swr';
import { getCommentsForPost } from '../services/commentService';

export const useComments = (postId, isOpen, cursor = null, limit = 10) => {
  const key = isOpen ? `/posts/${postId}/comments?cursor=${cursor || ''}&limit=${limit}` : null;
  const { data, error, mutate } = useSWR(
    key,
    () => getCommentsForPost(postId, cursor, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  );

  return {
    comments: data?.data || [],
    totalCount: data?.totalCount || 0,
    nextCursor: data?.nextCursor || null,
    isLoading: !error && !data && isOpen,
    isError: error,
    mutate,
  };
};
