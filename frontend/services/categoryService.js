// services/categoryService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const getCategories = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/categories?page=${page}&limit=${limit}`);
    const data = response.data;

    // Kiểm tra định dạng dữ liệu trả về
    if (
      !data ||
      !Array.isArray(data.data) ||
      typeof data.total_count !== 'number'
    ) {
      throw new Error('Invalid response format for getCategories');
    }

    // Đảm bảo trả về đúng tên thuộc tính
    return {
      categories: data.data, // Sử dụng data.data
      totalCount: data.total_count, // Sử dụng total_count
    };
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
};

export const getTopCategories = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/categories_top?page=${page}&limit=${limit}`);
    const data = response.data;

    // Kiểm tra định dạng dữ liệu trả về
    if (
      !data ||
      !Array.isArray(data.data) ||
      typeof data.total_count !== 'number'
    ) {
      throw new Error('Invalid response format for getCategories');
    }

    // Đảm bảo trả về đúng tên thuộc tính
    return {
      categories: data.data, // Sử dụng data.data
      totalCount: data.total_count, // Sử dụng total_count
    };
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
};


export const getPostsByCategory = async (categoryName, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(
      `/categories/${encodeURIComponent(categoryName)}/posts?page=${page}&limit=${limit}`
    );
    const data = response.data;

    // Kiểm tra định dạng dữ liệu trả về
    if (
      !data ||
      !Array.isArray(data.data) ||
      typeof data.total_count !== 'number'
    ) {
      throw new Error('Invalid response format for getPostsByCategory');
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error('Error in getPostsByCategory:', error);
    throw error;
  }
};
