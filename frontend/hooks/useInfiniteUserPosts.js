// hooks/useInfiniteUserPosts.js
import { fetchUserPosts } from '../services/userService';
import { useInfiniteList } from './useInfiniteList';

export const useInfiniteUserPosts = (username) =>
  useInfiniteList({
    key: ['userPosts', username],
    fetcher: async (page, limit) => {
      const data = await fetchUserPosts(username, page, limit);
      return {
        posts: data.posts || data.data || [],
        totalCount: data.totalCount || data.total_count || 0,
      };
    },
    enabled: !!username && username.trim() !== '',
    swrOptions: { dedupingInterval: 5000 },
  });
