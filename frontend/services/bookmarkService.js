// services/bookmarkService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';

// Bookmark a post
export const bookmarkPost = async (postId) => {
  const response = await axiosPrivateInstance.post('/api/bookmarks', {
    post_id: postId,
  });
  return response.data;
};

// Unbookmark a post
export const unBookmarkPost = async (postId) => {
  const response = await axiosPrivateInstance.post('/api/bookmarks/unbookmark', {
    post_id: postId,
  });
  return response.data;
};

// Get reading list with pagination
export const getReadingList = async (page = 1, limit = 10 ) => { // Tăng limit để lấy tất cả bookmarks
  const response = await axiosPrivateInstance.get(`/api/bookmarks?page=${page}&limit=${limit}`);
  const data = response.data;
  // Kiểm tra định dạng dữ liệu trả về
  if (
    !data ||
    !Array.isArray(data.data) ||
    typeof data.total_count !== 'number'
  ) {
    throw new Error('Invalid response format for getReadingList');
  }

  return {
    username: "pdhoang91",
    posts: data.data,
    totalCount: data.total_count,
  };
};

// Kiểm tra xem một post đã được bookmark chưa
export const isBookmarked = async (postId) => {
  const response = await axiosPrivateInstance.get(`/api/bookmarks/isBookmarked/${postId}`);
  return response.data;
};
