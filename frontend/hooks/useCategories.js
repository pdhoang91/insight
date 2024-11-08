// hooks/useCategories.js
import useSWR from 'swr';
import { getCategories, getTopCategories } from '../services/categoryService';

export const useCategories = (page = 1, limit = 10) => {
  const { data, error } = useSWR('/categories', () => getCategories(page, limit), {
    revalidateOnMount: true,
  });

  return {
    categories: data ? data.categories : [],
    totalCount: data ? data.totalCount : 0,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useTopCategories = (page = 1, limit = 10) => {
  const { data, error } = useSWR('/categories_top', () => getTopCategories(page, limit), {
    revalidateOnMount: true,
  });

  return {
    categories: data ? data.categories : [],
    totalCount: data ? data.totalCount : 0,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useCategoriesWithPosts = (categoryName, page = 1, limit = 10) => {
  const { data, error } = useSWR(
    `/categories/${encodeURIComponent(categoryName)}/posts?page=${page}&limit=${limit}`,
    () => getPostsByCategory(categoryName, page, limit)
  );

  return {
    posts: data ? data.posts : [],
    totalCount: data ? data.totalCount : 0,
    isLoading: !error && !data,
    isError: error,
  };
};
