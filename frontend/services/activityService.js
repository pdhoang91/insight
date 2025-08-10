// services/activityService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

// Gửi clap cho bài viết
export const clapPost = async (postID) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/post/${postID}/clap`);
    return response.data;
  } catch (error) {
    console.error('Error clapping post:', error);
    throw error;
  }
};

// Unclap bài viết
export const unclapPost = async (postId) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/post/${postId}/unclap`);
    return response.data;
  } catch (error) {
    console.error('Error unclappping post:', error);
    throw error;
  }
};

// Gửi clap cho comment
export const clapComment = async (commentID) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/comment/${commentID}/clap`);
    return response.data;
  } catch (error) {
    console.error('Error clapping comment:', error);
    throw error;
  }
};

// Gửi clap cho reply
export const clapReply = async (replyId) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/reply/${replyId}/clap`);
    return response.data;
  } catch (error) {
    console.error('Error clapping reply:', error);
    throw error;
  }
};

// Lấy số lượng claps
export const getClapsCount = async (type, id) => {
  try {
    const response = await axiosPublicInstance.get(`/claps?type=${type}&id=${id}`);
    const data = response.data;
    
    return data.clap_count || 0;
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

