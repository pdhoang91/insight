// hooks/useCategories.js
import useSWR from 'swr';
import { getCategories, getPopularCategories, getPostsByCategory } from '../services/categoryService';

export const useCategories = (page = 1, limit = 10) => {
  const { data, error, mutate } = useSWR(
    `/categories/popular?page=${page}&limit=${limit}`,
    () => getPopularCategories(page, limit),
    {
      revalidateOnMount: true,
      dedupingInterval: 300000,
    }
  );

  return {
    categories: data ? data.categories : [],
    totalCount: data ? data.totalCount : 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const useCategoriesWithPosts = (categoryName, page = 1, limit = 10) => {
  const { data, error, mutate } = useSWR(
    categoryName ? `/categories/${encodeURIComponent(categoryName)}/posts?page=${page}&limit=${limit}` : null,
    () => getPostsByCategory(categoryName, page, limit),
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
