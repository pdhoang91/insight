import { Post, PaginatedResponse, ApiResponse } from '@/types';
import { axiosPrivateInstance } from '@/lib/axios';

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export const bookmarkService = {
  async bookmarkPost(postId: string): Promise<ApiResponse<{ bookmarked: boolean }>> {
    try {
      const response = await axiosPrivateInstance.post('/api/bookmarks', {
        post_id: postId,
      });
      
      return {
        data: response.data,
        message: 'Post bookmarked successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error bookmarking post:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to bookmark post';
      throw new Error(errorMessage);
    }
  },

  async unbookmarkPost(postId: string): Promise<ApiResponse<{ bookmarked: boolean }>> {
    try {
      const response = await axiosPrivateInstance.delete(`/api/bookmarks/${postId}`);
      
      return {
        data: response.data,
        message: 'Post unbookmarked successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error unbookmarking post:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to unbookmark post';
      throw new Error(errorMessage);
    }
  },

  async getReadingList(page = 1, limit = 10): Promise<PaginatedResponse<Post> & { username: string }> {
    try {
      const response = await axiosPrivateInstance.get(`/api/bookmarks?page=${page}&limit=${limit}`);
      const data = response.data;

      // Check data format
      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getReadingList');
      }

      return {
        username: data.username || 'user', // fallback username
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
      console.error('Error fetching reading list:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch reading list';
      throw new Error(errorMessage);
    }
  },

  async isBookmarked(postId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosPrivateInstance.get(`/api/bookmarks/${postId}/check`);
      
      return {
        data: response.data.bookmarked || false,
        message: 'Bookmark status fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      // Return false if there's an error (user not authenticated, etc.)
      return {
        data: false,
        message: 'Bookmark status check failed',
        status: 200,
      };
    }
  },
}; 