// services/postService.js
import axiosPublicInstance, { axiosPublicInstanceSimple } from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';

export const createPost = async (postData) => {
  const response = await axiosPrivateInstance.post('/api/posts', postData);
  return response.data;
};

export const getPostById = async (id) => {
  const response = await axiosPublicInstance.get(`/posts/${id}`);
  return response.data;
};

export const getPostByTitleName = async (titleName) => {
  const response = await axiosPublicInstance.get(`/p/${titleName}`);
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

export const getPosts = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get('/posts', {
      params: { page, limit },
    });

    const data = response.data;
    
    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
      throw new Error('Invalid response format for getPosts');
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error('Error in getPosts:', error);
    throw error;
  }
};

export const getPostsByCategory = async (category, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/posts/category/${encodeURIComponent(category)}`, {
      params: { page, limit },
    });

    const data = response.data;
    
    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
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

export const getRecentPosts = async (limit = 10) => {
  try {
    const response = await axiosPublicInstance.get('/posts/recent', {
      params: { limit },
    });

    const data = response.data;
    
    if (!data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data;
  } catch (error) {
    console.error('Error in getRecentPosts:', error);
    return [];
  }
};

export const getTopPosts = async (limit = 10) => {
  try {
    const response = await axiosPublicInstance.get('/posts/top', {
      params: { limit },
    });

    const data = response.data;
    
    if (!data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data;
  } catch (error) {
    console.error('Error in getTopPosts:', error);
    return [];
  }
};

export const getFollowingPosts = async (page = 1, limit = 10) => {
  try {
    const response = await axiosPrivateInstance.get('/api/posts/following', {
      params: { page, limit },
    });

    const data = response.data;
    
    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
      throw new Error('Invalid response format for getFollowingPosts');
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error('Error in getFollowingPosts:', error);
    throw error;
  }
};

export const getLatestPosts = async (limit = 5) => {
  try {
    const response = await axiosPublicInstanceSimple.get('/posts/latest', {
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

export const getPopularPosts = async (limit = 5) => {
  try {
    const response = await axiosPublicInstanceSimple.get('/posts/popular', {
      params: { limit },
    });

    const data = response.data;
    
    if (!data || !Array.isArray(data.data)) {
      // Fallback to regular posts if popular endpoint fails
      const fallbackResponse = await axiosPublicInstance.get('/posts', {
        params: { limit },
      });
      return fallbackResponse.data?.data || [];
    }

    return data.data;
  } catch (error) {
    console.error('Error in getPopularPosts:', error);
    // Fallback to regular posts if popular endpoint fails
    try {
      const fallbackResponse = await axiosPublicInstance.get('/posts', {
        params: { limit },
      });
      return fallbackResponse.data?.data || [];
    } catch (fallbackError) {
      console.error('Error in getPopularPosts fallback:', fallbackError);
      return [];
    }
  }
};