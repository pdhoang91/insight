// hooks/useRecentPosts.js
import useSWR from 'swr';
import { getPosts } from '../services/postService';

export const useRecentPosts = (limit = 4) => {
  const { data, error, mutate } = useSWR(
    `/posts/recent?limit=${limit}`,
    () => getPosts(1, limit, 'recent'), // Use recent sorting
    {
      revalidateOnMount: true,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  return {
    posts: data ? data.posts : [],
    totalCount: data ? data.totalCount : 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}; 