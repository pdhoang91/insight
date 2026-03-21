// hooks/useInfinitePostByTag.js
import useSWRInfinite from 'swr/infinite';
import { getPostsByTag } from '../services/tagService';

export const useInfinitePostByTag = (tagName) => {
  const PAGE_SIZE = 10;

  const fetcher = async (page, limit) => {
    const data = await getPostsByTag(tagName, page, limit);
    return { posts: data.posts, totalCount: data.totalCount };
  };

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && previousPageData.posts.length === 0) return null;
    return [pageIndex + 1, PAGE_SIZE];
  };

  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([page, limit]) => fetcher(page, limit)
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.posts?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.posts?.length < PAGE_SIZE);

  const posts = data
    ? data
        .map((page) => page.posts || [])
        .flat()
        .filter((post, index, self) => self.findIndex((p) => p.id === post.id) === index)
    : [];
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  return {
    posts,
    totalCount,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
  };
};
