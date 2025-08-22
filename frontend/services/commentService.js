// services/commentService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const getCommentsForPost = async (postId, page = 1, limit = 10) => {
    const response = await axiosPublicInstance.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
    const { data, total_count, total_comment_reply } = response.data;
 
    return {
      data: data,
      totalCommentReply: total_comment_reply, 
      totalCount: total_count,
    };
  };

// Add comment - only needs postId and content (user is from auth token)
export const addComment = async (postId, content) => {
  const response = await axiosPrivateInstance.post(`/api/posts/${postId}/comments`, {
    post_id: postId,
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
