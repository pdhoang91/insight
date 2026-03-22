// hooks/useInfinitePosts.js
import { getPosts } from '../services/postService';
import { useInfiniteList } from './useInfiniteList';

export const useInfinitePosts = (fallbackData) =>
  useInfiniteList({
    key: 'posts',
    fetcher: (page, limit) => getPosts(page, limit),
    swrOptions: {
      fallbackData: fallbackData || undefined,
      dedupingInterval: 10000,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    },
  });
