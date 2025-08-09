import { Category, PaginatedResponse, ApiResponse } from '@/types';
import { axiosPublicInstance } from '@/lib/axios';

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export const categoryService = {
  async getCategories(page = 1, limit = 10): Promise<PaginatedResponse<Category>> {
    try {
      const response = await axiosPublicInstance.get(`/categories?page=${page}&limit=${limit}`);
      const data = response.data;

      // Check data format
      if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
        throw new Error('Invalid response format for getCategories');
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
      console.error('Error in getCategories:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch categories';
      throw new Error(errorMessage);
    }
  },

  async getTopCategories(limit = 10): Promise<ApiResponse<Category[]>> {
    try {
      const response = await axiosPublicInstance.get(`/categories/top?limit=${limit}`);
      const data = response.data;

      return {
        data: Array.isArray(data.data) ? data.data : data,
        message: 'Top categories fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error in getTopCategories:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch top categories';
      throw new Error(errorMessage);
    }
  },

  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    try {
      const response = await axiosPublicInstance.get(`/categories/${encodeURIComponent(slug)}`);
      
      return {
        data: response.data,
        message: 'Category fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch category';
      throw new Error(errorMessage);
    }
  },

  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await axiosPublicInstance.get('/categories/all');
      const data = response.data;

      return {
        data: Array.isArray(data.data) ? data.data : data,
        message: 'All categories fetched successfully',
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching all categories:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to fetch all categories';
      throw new Error(errorMessage);
    }
  },
}; 