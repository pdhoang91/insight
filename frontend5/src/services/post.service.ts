import { Post, PaginatedResponse, ApiResponse, SearchFilters } from '@/types';
import { axiosPublicInstance, axiosPrivateInstance } from '@/lib/axios';

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export const postService = {
  async getPosts(page = 1, limit = 10, filters?: SearchFilters): Promise<PaginatedResponse<Post>> {
    try {
      let endpoint = `/posts?page=${page}&limit=${limit}`;
      
      // Add filters to query params
      if (filters?.sortBy) {
        endpoint += `&sort=${filters.sortBy}`;
      }
      if (filters?.category) {
        endpoint += `&category=${encodeURIComponent(filters.category)}`;
      }
      if (filters?.search) {
        endpoint += `&q=${encodeURIComponent(filters.search)}`;
      }
      if (filters?.tags && filters.tags.length > 0) {
        endpoint += `&tags=${filters.tags.map(tag => encodeURIComponent(tag)).join(',')}`;
      }

      const response = await axiosPublicInstance.get(endpoint);
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getPosts');
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
      console.error('Error fetching posts:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch posts';
      throw new Error(errorMessage);
    }
  },

  async getPopularPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const response = await axiosPublicInstance.get(`/posts/popular?page=${page}&limit=${limit}`);
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getPopularPosts');
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
      console.error('Error fetching popular posts:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch popular posts';
      throw new Error(errorMessage);
    }
  },

  async getFeaturedPosts(limit = 6): Promise<ApiResponse<Post[]>> {
    try {
      const response = await axiosPublicInstance.get(`/posts/featured?limit=${limit}`);
      const data = response.data;

      return {
        data: Array.isArray(data.data) ? data.data : data,
        message: 'Featured posts fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch featured posts';
      throw new Error(errorMessage);
    }
  },

  async getLatestPosts(limit = 10): Promise<ApiResponse<Post[]>> {
    try {
      const response = await axiosPublicInstance.get(`/posts?limit=${limit}`);
      const data = response.data;

      return {
        data: Array.isArray(data.data) ? data.data : data,
        message: 'Latest posts fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch latest posts';
      throw new Error(errorMessage);
    }
  },

  async getPost(id: string, slug?: string): Promise<ApiResponse<Post>> {
    try {
      let endpoint = '';
      if (slug) {
        endpoint = `/posts/slug/${encodeURIComponent(slug)}`;
      } else {
        endpoint = `/posts/${id}`;
      }

      const response = await axiosPublicInstance.get(endpoint);
      
      return {
        data: response.data,
        message: 'Post fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch post';
      throw new Error(errorMessage);
    }
  },

  async getRelatedPosts(postId: string, limit = 4): Promise<ApiResponse<Post[]>> {
    try {
      const response = await axiosPublicInstance.get(`/posts/${postId}/related?limit=${limit}`);
      const data = response.data;

      return {
        data: Array.isArray(data.data) ? data.data : data,
        message: 'Related posts fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching related posts:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch related posts';
      throw new Error(errorMessage);
    }
  },

  async getUserPosts(username: string, page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
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

  async getFollowingPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const response = await axiosPrivateInstance.get(`/api/posts/following?page=${page}&limit=${limit}`);
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getFollowingPosts');
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
      console.error('Error fetching following posts:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch following posts';
      throw new Error(errorMessage);
    }
  },

  async getPostsByCategory(categoryName: string, page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const response = await axiosPublicInstance.get(
        `/categories/${encodeURIComponent(categoryName)}/posts?page=${page}&limit=${limit}`
      );
      const data = response.data;

      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getPostsByCategory');
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
      console.error('Error in getPostsByCategory:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch posts by category';
      throw new Error(errorMessage);
    }
  },

  async createPost(postData: Record<string, unknown>): Promise<ApiResponse<Post>> {
    try {
      const response = await axiosPrivateInstance.post('/api/posts', postData);
      
      return {
        data: response.data,
        message: 'Post created successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to create post';
      throw new Error(errorMessage);
    }
  },

  async updatePost(postId: string, postData: Record<string, unknown>): Promise<ApiResponse<Post>> {
    try {
      const response = await axiosPrivateInstance.put(`/api/posts/${postId}`, postData);
      
      return {
        data: response.data,
        message: 'Post updated successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error updating post:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to update post';
      throw new Error(errorMessage);
    }
  },

  async deletePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosPrivateInstance.delete(`/api/posts/${postId}`);
      
      return {
        data: undefined,
        message: 'Post deleted successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error deleting post:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to delete post';
      throw new Error(errorMessage);
    }
  },

  // Clap/Like functionality
  async clapPost(postId: string): Promise<ApiResponse<{ clapped: boolean; clapsCount: number }>> {
    try {
      const response = await axiosPrivateInstance.post(`/api/posts/${postId}/clap`);
      
      return {
        data: response.data,
        message: 'Post clapped successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error clapping post:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to clap post';
      throw new Error(errorMessage);
    }
  },

  async checkHasClapped(postId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosPrivateInstance.get(`/api/posts/${postId}/clap/check`);
      
      return {
        data: response.data.clapped || false,
        message: 'Clap status fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error checking clap status:', error);
      // Return false if there's an error (user not authenticated, etc.)
      return {
        data: false,
        message: 'Clap status check failed',
        status: 200,
      };
    }
  },
}; 