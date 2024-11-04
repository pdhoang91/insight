// hooks/useUserPosts.js
import useSWR from 'swr';
import { getUserPosts } from '../services/userService';

export const useUserPosts = (userId) => {
  const { data, error, mutate } = useSWR(userId ? `/api/users/${userId}/posts` : null, () => getUserPosts(userId));

  return {
    posts: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
