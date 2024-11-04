// services/searchService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const fetchStories = async (query, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/search/posts`, {
      params: { q: query, page, limit },
    });

    const data = response.data;
    if (!data || !Array.isArray(data.data) || typeof data.total_count !== 'number') {
      throw new Error('Invalid response format for fetchStories');
    }

    return {
      posts: data ? data.data:[],
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};
export const fetchPeople = async (query, page = 1, limit = 10) => {
  try {
    const response = await axiosPublicInstance.get(`/search/people`, {
      params: { q: query, page, limit },
    });

    const data = response.data;

    // Kiểm tra và xử lý trường hợp data.data là null
    if (!data || typeof data.total_count !== 'number') {
      console.error("Data received:", data); // Kiểm tra dữ liệu nhận được
      throw new Error('Invalid response format for fetchPeople');
    }

    return {
      people: data.data || [], // Đảm bảo luôn trả về một mảng, ngay cả khi data.data là null
      totalCount: data.total_count,
    };
  } catch (error) {
    console.error('Error fetching people:', error);
    throw error;
  }
};
