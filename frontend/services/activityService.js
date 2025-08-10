// services/activityService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

// Gửi clap cho bài viết
export const clapPost = async (postID) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/posts/${postID}/claps`);
    return response.data;
  } catch (error) {
    console.error('Error clapping post:', error);
    throw error;
  }
};

// Unclap bài viết
export const unclapPost = async (postId) => {
  const response = await axiosPrivateInstance.post(`/api/posts/${postId}/unclap`);
  return response.data;
};

// Gửi clap cho comment
export const clapComment = async (commentID) => {
  const response = await axiosPrivateInstance.post(`/api/comment/${commentID}/clap`);
  return response.data;
};

// Gửi clap cho reply
export const clapReply = async (replyId) => {
  const response = await axiosPrivateInstance.post(`/api/reply/${replyId}/clap`); // Pass token if necessary
  return response.data;
};

// Lấy số lượng claps
export const getClapsCount = async (type, id) => {
  try {
    let url = '';
    if (type === 'post') {
      url = `/posts/${id}/claps`;
    } else if (type === 'comment') {
      url = `/comments/${id}/claps`;
    } else {
      throw new Error('Invalid type for claps');
    }

    const response = await axiosPublicInstance.get(url);
    const data = response.data;
    
    return data.count || 0;
  } catch (error) {
    console.error(`Error fetching claps count for ${type} ${id}:`, error);
    return 0;
  }
};

// Lấy activities của người dùng
export const getUserActivities = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/users/${userId}/activities`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

