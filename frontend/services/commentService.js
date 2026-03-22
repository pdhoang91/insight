// services/commentService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const getCommentsForPost = async (postId, cursor = null, limit = 10) => {
  const params = new URLSearchParams({ limit });
  if (cursor) params.set('cursor', cursor);
  const response = await axiosPublicInstance.get(`/posts/${postId}/comments?${params}`);
  const { data, total_count, next_cursor } = response.data;
  return {
    data: data || [],
    totalCount: total_count || 0,
    nextCursor: next_cursor || null,
  };
};

export const getRepliesForComment = async (commentId, cursor = null, limit = 10) => {
  const params = new URLSearchParams({ limit });
  if (cursor) params.set('cursor', cursor);
  const response = await axiosPublicInstance.get(`/comments/${commentId}/replies?${params}`);
  const { data, next_cursor } = response.data;
  return {
    data: data || [],
    nextCursor: next_cursor || null,
  };
};

// Add comment - only needs postId and content (user is from auth token)
export const addComment = async (postId, content) => {
  const response = await axiosPrivateInstance.post(`/api/posts/${postId}/comments`, {
    content,
  });
  return response.data;
};

// Add reply to comment
export const addReply = async (commentID, content) => {
  const response = await axiosPrivateInstance.post(`/api/comments/${commentID}/replies`, {
    content,
  });
  return response.data;
};
