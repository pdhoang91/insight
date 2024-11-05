// services/ratingService.js
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import axiosPublicInstance from '../utils/axiosPublicInstance';

// Gửi đánh giá cho bài viết
export const submitRating = async (postId, ratingValue) => {
  const response = await axiosPrivateInstance.post(`/api/posts/${postId}/ratings`, {
    post_id: postId,
    rating: ratingValue,
    score: ratingValue,
  });
  return response.data;
};

// Lấy điểm trung bình của bài viết
export const getAverageRating = async (postId) => {
  const response = await axiosPublicInstance.get(`/api/posts/${postId}/ratings`);
  const data = response.data;

  return data.average_rating;
};
