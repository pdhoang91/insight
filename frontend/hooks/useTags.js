// hooks/useTags.js
import useSWR from 'swr';
import { getTags, getPopularTags, getPostsByTag } from '../services/tagService';

// Hook to get all tags with pagination
export const useTags = (page = 1, limit = 20) => {
  const { data, error, mutate } = useSWR(
    `/tags?page=${page}&limit=${limit}`,
    () => getTags(page, limit),
    {
      revalidateOnMount: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    tags: data ? data.tags : [],
    totalCount: data ? data.totalCount : 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

// Hook to get popular tags (most used)
export const usePopularTags = (limit = 20) => {
  const { data, error, mutate } = useSWR(
    `/tags/popular?limit=${limit}`,
    () => getPopularTags(limit),
    {
      revalidateOnMount: true,
      dedupingInterval: 300000, // Cache for 5 minutes (popular tags don't change often)
    }
  );

  return {
    tags: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

// Hook to get posts by tag
export const usePostsByTag = (tagName, page = 1, limit = 10) => {
  const { data, error, mutate } = useSWR(
    tagName ? `/tags/${encodeURIComponent(tagName)}/posts?page=${page}&limit=${limit}` : null,
    () => getPostsByTag(tagName, page, limit),
    {
      revalidateOnMount: true,
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

// Hook for tag search functionality
export const useTagSearch = (query, limit = 10) => {
  const { data, error } = useSWR(
    query && query.length > 1 ? `/tags/search?q=${query}&limit=${limit}` : null,
    () => import('../services/tagService').then(module => module.searchTags(query, limit)),
    {
      dedupingInterval: 30000, // Cache search results for 30 seconds
    }
  );

  return {
    tags: data || [],
    isLoading: !error && !data && query && query.length > 1,
    isError: error,
  };
}; 