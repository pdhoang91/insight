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

