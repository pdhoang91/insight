import { Comment, PaginatedResponse, ApiResponse } from '@/types';
import { axiosPublicInstance, axiosPrivateInstance } from '@/lib/axios';

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export const commentService = {
  async getComments(postId: string, page = 1, limit = 10): Promise<PaginatedResponse<Comment> & { totalCommentReply: number }> {
    try {
      const response = await axiosPublicInstance.get(`/posts/${postId}/comments`, {
        params: { page, limit },
      });
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getComments');
      }

      return {
        data: data.data,
        totalCommentReply: data.total_reply_count || 0,
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
      console.error('Error fetching comments:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch comments';
      throw new Error(errorMessage);
    }
  },

  async createComment(postId: string, content: string, parentId?: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosPrivateInstance.post(`/api/posts/${postId}/comments`, {
        content,
        parent_id: parentId,
      });
      
      return {
        data: response.data,
        message: 'Comment created successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to create comment';
      throw new Error(errorMessage);
    }
  },

  async updateComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosPrivateInstance.put(`/api/comments/${commentId}`, {
        content,
      });
      
      return {
        data: response.data,
        message: 'Comment updated successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error updating comment:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to update comment';
      throw new Error(errorMessage);
    }
  },

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosPrivateInstance.delete(`/api/comments/${commentId}`);
      
      return {
        data: undefined,
        message: 'Comment deleted successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error deleting comment:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to delete comment';
      throw new Error(errorMessage);
    }
  },

  async getReplies(commentId: string, page = 1, limit = 5): Promise<PaginatedResponse<Comment>> {
    try {
      const response = await axiosPublicInstance.get(`/comments/${commentId}/replies`, {
        params: { page, limit },
      });
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getReplies');
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
      console.error('Error fetching replies:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch replies';
      throw new Error(errorMessage);
    }
  },

  // Like/Unlike comments
  async likeComment(commentId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
    try {
      const response = await axiosPrivateInstance.post(`/api/comments/${commentId}/like`);
      
      return {
        data: response.data,
        message: 'Comment liked successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error liking comment:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to like comment';
      throw new Error(errorMessage);
    }
  },

  async checkHasLiked(commentId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosPrivateInstance.get(`/api/comments/${commentId}/like/check`);
      
      return {
        data: response.data.liked || false,
        message: 'Like status fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error checking like status:', error);
      // Return false if there's an error (user not authenticated, etc.)
      return {
        data: false,
        message: 'Like status check failed',
        status: 200,
      };
    }
  },
}; 