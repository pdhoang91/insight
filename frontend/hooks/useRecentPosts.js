// hooks/useRecentPosts.js
import useSWR from 'swr';
import { getLatestPosts, getPopularPosts } from '../services/postService';

export const useRecentPosts = (limit = 5) => {
  const { data, error, mutate } = useSWR(
    `/posts/latest?limit=${limit}`,
    () => getLatestPosts(limit),
    {
      revalidateOnMount: true,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  return {
    posts: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const usePopularPosts = (limit = 5) => {
  const { data, error, mutate } = useSWR(
    `/posts/popular?limit=${limit}`,
    () => getPopularPosts(limit),
    {
      revalidateOnMount: true,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  return {
    posts: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}; 