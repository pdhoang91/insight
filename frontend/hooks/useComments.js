// hooks/useComments.js
import useSWR from 'swr';
import { getCommentsForPost } from '../services/commentService';

export const useComments = (postId, isOpen, page = 1, limit = 10) => {
  const key = isOpen ? `/posts/${postId}/comments?page=${page}&limit=${limit}` : null;
  const { data, error, mutate } = useSWR(
    key,
    () => getCommentsForPost(postId, page, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
      errorRetryCount: 2, // Only retry twice on error
      errorRetryInterval: 1000, // Wait 1 second between retries
    }
  );

  // Kiểm tra định dạng dữ liệu trả về
  if (data && (typeof data !== 'object' || !Array.isArray(data.data) || typeof data.totalCount !== 'number')) {
    console.error('Unexpected comments format:', data);
  }

  return {
    comments: data ? data.data : [],
    totalCount: data ? data.totalCount : 0,
    totalCommentReply: data ? data.totalCommentReply : 0,
    isLoading: !error && !data && isOpen, // Only show loading when actually trying to fetch
    isError: error,
    mutate,
  };
};
