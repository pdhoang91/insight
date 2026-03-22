// hooks/useInfinitePostByTag.js
import { getPostsByTag } from '../services/tagService';
import { useInfiniteList } from './useInfiniteList';

export const useInfinitePostByTag = (tagName) =>
  useInfiniteList({
    key: ['posts-tag', tagName],
    fetcher: (page, limit) => getPostsByTag(tagName, page, limit),
    dedupe: true,
  });
