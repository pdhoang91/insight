// services/postService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import { fetchPaginatedList } from '../utils/fetchPaginatedList';

export const createPost = async (postData) => {
  const response = await axiosPrivateInstance.post('/api/posts', postData);
  return response.data;
};

export const getPostById = async (id) => {
  const response = await axiosPublicInstance.get(`/posts/${id}`);
  return response.data.data.post;
};

export const getPostBySlug = async (slug) => {
  const response = await axiosPublicInstance.get(`/p/${slug}`);
  return response.data.data.post;
};

export const updatePost = async (id, postData) => {
  const response = await axiosPrivateInstance.put(`/api/posts/${id}`, postData);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await axiosPrivateInstance.delete(`/api/posts/${id}`);
  return response.data;
};

export const getArchiveSummary = async () => {
  const response = await axiosPublicInstance.get('/archive/summary');
  return response.data.data || [];
};

export const getPostsByYearMonth = async (year, month, page = 1, limit = 20) => {
  const response = await axiosPublicInstance.get(`/archive/${year}/${month}`, {
    params: { page, limit }
  });
  return {
    posts: response.data.data,
    totalCount: response.data.total_count,
    year: response.data.year,
    month: response.data.month,
    hasMore: response.data.data.length === limit
  };
};

export const getPosts = (page = 1, limit = 10) =>
  fetchPaginatedList(axiosPublicInstance, '/posts', { page, limit });

export const getLatestPosts = async (limit = 5) => {
  try {
    const response = await axiosPublicInstance.get('/posts/latest', {
      params: { limit },
    });

    const data = response.data;
    
    if (!data || !Array.isArray(data.data)) {
      // Fallback to regular posts if latest endpoint fails
      const fallbackResponse = await axiosPublicInstance.get('/posts', {
        params: { limit },
      });
      return fallbackResponse.data?.data || [];
    }

    return data.data;
  } catch (error) {
    console.error('Error in getLatestPosts:', error);
    // Fallback to regular posts if latest endpoint fails
    try {
      const fallbackResponse = await axiosPublicInstance.get('/posts', {
        params: { limit },
      });
      return fallbackResponse.data?.data || [];
    } catch (fallbackError) {
      console.error('Error in getLatestPosts fallback:', fallbackError);
      return [];
    }
  }
};

