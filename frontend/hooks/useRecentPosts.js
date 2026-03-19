// hooks/useRecentPosts.js
import useSWR from 'swr';
import { getLatestPosts } from '../services/postService';

export const useRecentPosts = (limit = 5) => {
  const { data, error, mutate } = useSWR(
    `/posts/latest?limit=${limit}`,
    () => getLatestPosts(limit),
    {
      revalidateOnMount: true,
      dedupingInterval: 300000,
    }
  );

  return {
    posts: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
