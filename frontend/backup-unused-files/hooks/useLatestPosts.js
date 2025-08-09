// hooks/useLatestPosts.js
import useSWR from 'swr';
import { getLatestPosts } from '../services/postService';

export const useLatestPosts = (limit = 5) => {
  const { data, error } = useSWR(`/posts?limit=${limit}`, () => getLatestPosts(limit));
  return {
    latestPosts: data,
    isLoading: !error && !data,
    isError: error,
  };
};
