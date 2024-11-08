// services/userService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const getUserProfile = async () => {
  const response = await axiosPrivateInstance.get('/api/me');
  return response.data;
};


export const updateUserProfile = async (userId, profileData) => {
  const response = await axiosPrivateInstance.put(`/api/users/${userId}`, profileData);
  return response.data;
};

export const getUserPosts = async (userId) => {
  const response = await axiosPrivateInstance.get(`/api/users/${userId}/posts`);
  const data = response.data;
  return data.data;
};

// Fetches public profile info for a user by username
export const fetchUserProfile = async (username) => {
  try {
    const response = await axiosPublicInstance.get(`/public/${username}/profile`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    throw error;
  }
};

export const fetchUserPosts = async (username, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/public/${username}/posts`, {
      params: { page, limit },
    });
    const data = response.data;

    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
      throw new Error('Invalid response format for getUserPosts');
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error(`Error fetching posts for user "${username}":`, error);
    throw error;
  }
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

// Kiểm tra trạng thái theo dõi của người dùng hiện tại đối với một user cụ thể
export const checkFollowingStatus = async (userId) => {
  try {
    const response = await axiosPrivateInstance.get(`/api/follow/status/${userId}`);
    return response.data; // { isFollowing: true/false }
  } catch (error) {
    console.error('Error checking following status:', error);
    throw error;
  }
};

// Follow một user
export const followUser = async (userId) => {
  try {
    const response = await axiosPrivateInstance.post('/api/follow', { following_id: userId });
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};




// Unfollow một user
export const unfollowUser = async (userId) => {
  try {
    const response = await axiosPrivateInstance.delete(`/api/follow/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};