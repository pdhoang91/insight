// hooks/useInfinitePostByCategory.js
import { getPostsByCategory } from '../services/categoryService';
import { useInfiniteList } from './useInfiniteList';

export const useInfinitePostByCategory = (name) =>
  useInfiniteList({
    key: ['posts-category', name],
    fetcher: (page, limit) => getPostsByCategory(name, page, limit),
    dedupe: true,
  });
