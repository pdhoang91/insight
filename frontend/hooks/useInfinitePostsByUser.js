// hooks/useInfinitePostsByUser.js
import useSWRInfinite from 'swr/infinite';
import { fetchUserPosts } from '../services/userService';

export const useInfinitePostsByUser = (username) => {
  const PAGE_SIZE = 10;

  const fetcher = async (page, limit) => {
    if (!username) return { posts: [], totalCount: 0 }; // Prevents fetching if username is undefined
    const data = await fetchUserPosts(username, page, limit);
    return { posts: data.posts, totalCount: data.totalCount };
  };

  const getKey = (pageIndex, previousPageData) => {
    if (!username || (previousPageData && previousPageData.posts.length === 0)) return null;
    return [pageIndex + 1, PAGE_SIZE];
  };

  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([page, limit]) => fetcher(page, limit)
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.posts?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.posts?.length < PAGE_SIZE);

  const posts = data
    ? data
        .map(page => page.posts || [])
        .flat()
        .filter((post, index, self) => self.findIndex(p => p.id === post.id) === index)
    : [];
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  return {
    posts,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    totalCount,
  };
};
