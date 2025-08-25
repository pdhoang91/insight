// services/userService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';


// Remove auth service instance - use application service instead

// Get current user profile (authenticated)
export const getUserProfile = async () => {
  const response = await axiosPrivateInstance.get('/api/me');
  // Backend returns {"data": userResponse}, extract the user data
  return response.data.data || response.data;
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
      return response.data.data || response.data;
    } catch (authError) {
      // Fallback to public request if auth fails
      const response = await axiosPublicInstance.get(`/public/${username}/profile`);
      return response.data.data || response.data;
    }
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    throw error;
  }
};

