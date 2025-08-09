// hooks/useFollowingPosts.js
import useSWR from 'swr';
import { getFollowingPosts } from '../services/postService';

export const useFollowingPosts = (page = 1, limit = 10) => {
  const { data, error } = useSWR(
    [`/api/following/posts`, page, limit],
    () => getFollowingPosts(page, limit)
  );

  return {
    posts: data ? data.data : [],
    totalCount: data ? data.total_count : 0,
    isLoading: !error && !data,
    isError: error,
  };
};
