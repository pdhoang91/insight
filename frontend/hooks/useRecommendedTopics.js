// hooks/useRecommendedTopics.js
import useSWR from 'swr';
import { getRecommendedTopics } from '../services/topicService';

export const useRecommendedTopics = () => {
  const { data, error } = useSWR('/topics/recommended', getRecommendedTopics);
  return {
    recommendedTopics: data,
    isLoading: !error && !data,
    isError: error,
  };
};
