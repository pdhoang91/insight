import { User, Post, PaginatedResponse, ApiResponse } from '@/types';
import { axiosPublicInstance, axiosPrivateInstance } from '@/lib/axios';

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export const userService = {
  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await axiosPrivateInstance.get('/api/me');
      
      return {
        data: response.data,
        message: 'User profile fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch user profile';
      throw new Error(errorMessage);
    }
  },

  async fetchUserProfile(username: string): Promise<ApiResponse<User>> {
    try {
      const response = await axiosPublicInstance.get(`/public/${username}`);
      
      return {
        data: response.data,
        message: 'Public user profile fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error(`Error fetching profile for user "${username}":`, error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch user profile';
      throw new Error(errorMessage);
    }
  },

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await axiosPrivateInstance.put(`/api/users/${userId}`, profileData);
      
      return {
        data: response.data,
        message: 'Profile updated successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  async fetchUserPosts(username: string, page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const response = await axiosPublicInstance.get(`/public/${username}/posts`, {
        params: { page, limit },
      });
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getUserPosts');
      }

      return {
        data: data.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(data.total_count / limit),
          totalItems: data.total_count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(data.total_count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error(`Error fetching posts for user "${username}":`, error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch user posts';
      throw new Error(errorMessage);
    }
  },

  async fetchSuggestedProfiles(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await axiosPublicInstance.get('/users/suggested', {
        params: { page, limit },
      });
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      return {
        data: data.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(data.total_count / limit),
          totalItems: data.total_count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(data.total_count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching suggested profiles:', error);
      // Return empty result for better UX
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  },

  // Follow/Unfollow functionality
  async followUser(userId: string): Promise<ApiResponse<{ following: boolean }>> {
    try {
      const response = await axiosPrivateInstance.post(`/api/users/${userId}/follow`);
      
      return {
        data: response.data,
        message: 'User followed successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error following user:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to follow user';
      throw new Error(errorMessage);
    }
  },

  async unfollowUser(userId: string): Promise<ApiResponse<{ following: boolean }>> {
    try {
      const response = await axiosPrivateInstance.delete(`/api/users/${userId}/follow`);
      
      return {
        data: response.data,
        message: 'User unfollowed successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to unfollow user';
      throw new Error(errorMessage);
    }
  },

  async checkIsFollowing(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosPrivateInstance.get(`/api/users/${userId}/follow/check`);
      
      return {
        data: response.data.following || false,
        message: 'Follow status fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error checking follow status:', error);
      // Return false if there's an error (user not authenticated, etc.)
      return {
        data: false,
        message: 'Follow status check failed',
        status: 200,
      };
    }
  },

  async getFollowers(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await axiosPublicInstance.get(`/users/${userId}/followers`, {
        params: { page, limit },
      });
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      return {
        data: data.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(data.total_count / limit),
          totalItems: data.total_count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(data.total_count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching followers:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch followers';
      throw new Error(errorMessage);
    }
  },

  async getFollowing(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await axiosPublicInstance.get(`/users/${userId}/following`, {
        params: { page, limit },
      });
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      return {
        data: data.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(data.total_count / limit),
          totalItems: data.total_count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(data.total_count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching following:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch following';
      throw new Error(errorMessage);
    }
  },
}; 