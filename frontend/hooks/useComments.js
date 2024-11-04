// hooks/useComments.js
import useSWR from 'swr';
import { getCommentsForPost } from '../services/commentService';

export const useComments = (postId, isOpen, page = 1, limit = 10) => {
  const key = isOpen ? `/posts/${postId}/comments?page=${page}&limit=${limit}` : null;
  const { data, error, mutate } = useSWR(
    key,
    () => getCommentsForPost(postId, page, limit)
  );

// Kiểm tra định dạng dữ liệu trả về
if (data && (typeof data !== 'object' || !Array.isArray(data.data) || typeof data.totalCount !== 'number')) {
  console.error('Unexpected comments format:', data);
}

  return {
    comments: data ? data.data : [],
    totalCount: data ? data.totalCount : 0,
    totalCommentReply: data ? data.totalCommentReply : 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
