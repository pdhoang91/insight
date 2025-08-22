// services/activityService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

// Gửi clap cho bài viết
export const clapPost = async (postID) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/posts/${postID}/clap`);
    return response.data;
  } catch (error) {
    console.error('Error clapping post:', error);
    throw error;
  }
};



// Gửi clap cho comment
export const clapComment = async (commentID) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/comments/${commentID}/clap`);
    return response.data;
  } catch (error) {
    console.error('Error clapping comment:', error);
    throw error;
  }
};

// Gửi clap cho reply
export const clapReply = async (replyId) => {
  try {
    const response = await axiosPrivateInstance.post(`/api/replies/${replyId}/clap`);
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

// Check if user has clapped an item
export const checkUserClapStatus = async (type, id) => {
  try {
    const response = await axiosPublicInstance.get(`/claps/status?type=${type}&id=${id}`);
    return response.data.has_clapped || false;
  } catch (error) {
    console.error(`Error checking clap status for ${type} ${id}:`, error);
    return false;
  }
};

// Get both clap count and user clap status in one call (optimized)
export const getClapInfo = async (type, id) => {
  try {
    const response = await axiosPublicInstance.get(`/claps/info?type=${type}&id=${id}`);
    return {
      clapCount: response.data.clap_count || 0,
      hasClapped: response.data.has_clapped || false,
    };
  } catch (error) {
    console.error(`Error fetching clap info for ${type} ${id}:`, error);
    return {
      clapCount: 0,
      hasClapped: false,
    };
  }
};

