// services/userService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';


// Remove auth service instance - use application service instead

// Get current user profile (authenticated)
export const getUserProfile = async () => {
  const response = await axiosPrivateInstance.get('/api/me');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  const response = await axiosPrivateInstance.put(`/api/users/${userId}`, profileData);
  return response.data;
};

// Get authenticated user's posts
export const getUserPosts = async (userId) => {
  const response = await axiosPrivateInstance.get(`/api/users/${userId}/posts`);
  const data = response.data;
  return data.data;
};

// Fetches public posts for a user by username
export const fetchUserPosts = async (username, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/public/${username}/posts`, {
      params: { page, limit },
    });

    const data = response.data;
    if (!data || !Array.isArray(data.data)) {
      return {
        posts: [],
        totalCount: 0,
      };
    }

    return {
      posts: data.data,
      totalCount: data.total_count || 0,
    };
  } catch (error) {
    console.error(`Error fetching posts for ${username}":`, error);
    throw error;
  }
};

// Fetches public profile info for a user by username
export const fetchUserProfile = async (username) => {
  try {
    // Try authenticated request first (for admin users to get role info)
    try {
      const response = await axiosPrivateInstance.get(`/public/${username}/profile`);
      return response.data;
    } catch (authError) {
      // Fallback to public request if auth fails
      const response = await axiosPublicInstance.get(`/public/${username}/profile`);
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    throw error;
  }
};

// Lấy các người dùng đã folow
export const fetchUserFolow = async (username, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/public/${username}/follow`, {
      params: { page, limit },
    });

    const data = response.data;
    if (!data || !Array.isArray(data.data)) {
      return {
        follows: [],
        totalCount: 0,
      };
    }

    return {
      follows: data.data,
      totalCount: data.total_count || 0,
    };
  } catch (error) {
    console.error(`Error fetching follows for ${username}:`, error);
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