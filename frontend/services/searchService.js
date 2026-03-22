// services/searchService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';
import { fetchPaginatedList } from '../utils/fetchPaginatedList';

export const fetchStories = async (query, page = 1, limit = 10) => {
  try {
    return await fetchPaginatedList(axiosPublicInstance, '/search/posts', { q: query, page, limit });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return { posts: [], totalCount: 0 };
  }
};
