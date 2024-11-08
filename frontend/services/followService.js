// services/followService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const checkFollowingStatus = async (followingId) => {
  const response = await axiosPrivateInstance.get(`/api/follow/status/${followingId}`);
  return response.data;
};

export const followUser = async (followingId) => {
  const response = await axiosPrivateInstance.post('/api/follow', { following_id: followingId });
  return response.data;
};

export const unfollowUser = async (followingId) => {
  const response = await axiosPrivateInstance.delete(`/api/unfollow/${followingId}`);
  return response.data;
};


// Lấy các người dùng được gợi ý
export const fetchSuggestedProfiles = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateInstance.get('/api/follow/suggested-profiles', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggested profiles:', error);
    throw error;
  }
};


// Lấy các writers phổ biến nhất
export const getAvailableWriters = async () => {
  try {
    const response = await axiosPublicInstance.get('/follow/writers');
    return response.data.data; // Giả sử trả về mảng các writers
  } catch (error) {
    console.error('Error fetching writers:', error);
    throw error;
  }
};

// Lấy các topics phổ biến nhất
export const getAvailableTopics = async () => {
  try {
    const response = await axiosPublicInstance.get('/follow/topics');
    return response.data.data; // Giả sử trả về mảng các topics
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};