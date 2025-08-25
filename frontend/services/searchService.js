// services/searchService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const fetchStories = async (query, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/search/posts`, {
      params: { q: query, page, limit },
    });

    const data = response.data;


    // Kiểm tra định dạng của `data` và `data.data`
    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
      return {
        posts: [],
        totalCount: 0,
      };
    }

    return {
      posts: data.data,
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error('Error fetching stories:', error);
    return {
      posts: [],
      totalCount: 0,
    };
  }
};



export const trackSearch = async (query, userId = null, resultsCount = 0) => {
  try {
    await axiosPublicInstance.post(`/search/track`, {
      query,
      user_id: userId,
      results_count: resultsCount,
    });
  } catch (error) {
    console.error('Error tracking search:', error);
    // Don't throw error for analytics tracking
  }
};
