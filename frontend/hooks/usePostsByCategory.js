// hooks/usePostsByCategory.js
import useSWR from 'swr';
import { getPostsByCategory } from '../services/categoryService';

export const usePostsByCategory = (categoryName, limit = 2) => {
  const { data, error } = useSWR(
    ['/categories', categoryName, 1, limit],
    () => getPostsByCategory(categoryName, 1, limit)
  );

  return {
    posts: data ? data.posts : [],
    totalCount: data ? data.totalCount : 0,
    isLoading: !error && !data,
    isError: error,
  };
};
