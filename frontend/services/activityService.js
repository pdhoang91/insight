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

