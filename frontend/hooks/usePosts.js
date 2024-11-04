// hooks/usePosts.js
import useSWR from 'swr';
import { getPosts } from '../services/postService';

export const usePosts = (page = 1, limit = 10) => {
  const { data, error } = useSWR(
    `/posts?page=${page}&limit=${limit}`,
    () => getPosts(page, limit)
  );

  return {
    posts: data ? data.data : [],
    totalCount: data ? data.total_count : 0,
    isLoading: !error && !data,
    isError: error,
  };
};
