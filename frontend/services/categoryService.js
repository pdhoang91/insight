// services/categoryService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import { fetchPaginatedList } from '../utils/fetchPaginatedList';

export const getCategories = (page = 1, limit = 10) =>
  fetchPaginatedList(axiosPublicInstance, '/categories', { page, limit }, 'categories');

export const getTopCategories = (page = 1, limit = 10) =>
  fetchPaginatedList(axiosPublicInstance, '/categories/top', { page, limit }, 'categories');


export const getPostsByCategory = (categoryName, page = 1, limit = 10) =>
  fetchPaginatedList(
    axiosPublicInstance,
    `/categories/${encodeURIComponent(categoryName)}/posts`,
    { page, limit }
  );

export const getPopularCategories = async (page = 1, limit = 7) => {
  try {
    return await fetchPaginatedList(axiosPublicInstance, '/categories/popular', { page, limit }, 'categories');
  } catch {
    // Fallback to regular categories if popular endpoint is unavailable
    try {
      return await fetchPaginatedList(axiosPublicInstance, '/categories', { page, limit }, 'categories');
    } catch {
      return { categories: [], totalCount: 0 };
    }
  }
};

export const createCategory = async (name) => {
  const response = await axiosPrivateInstance.post('/admin/categories', { name: name.trim() });
  return response.data.data; // unwrap gin.H{"data": ...} wrapper
};
