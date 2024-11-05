// services/topicService.js
import axiosPublicInstance from '../utils/axiosPublicInstance';

export const getRecommendedTopics = async () => {
  const response = await axiosPublicInstance.get(`/api/topics/recommended`);
  const data = response.data;
  return data.data;
};
