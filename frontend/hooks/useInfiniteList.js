// hooks/useInfiniteList.js
// Generic hook for offset-based infinite scroll pagination.
// Replaces the ~90% identical logic across 6 hooks.
import useSWRInfinite from 'swr/infinite';

/**
 * @param {object} options
 * @param {string|string[]} options.key      - SWR cache key prefix (include all deps, e.g. ['posts-tag', tagName])
 * @param {Function}        options.fetcher  - async (page, limit) => { posts: [], totalCount: number }
 * @param {number}          [options.pageSize=10]
 * @param {boolean}         [options.enabled=true]  - set false to skip fetching (e.g. missing param)
 * @param {boolean}         [options.dedupe=false]   - deduplicate items by `id` using a Set (O(n))
 * @param {object}          [options.swrOptions={}]  - extra options forwarded to useSWRInfinite
 */
export const useInfiniteList = ({
  key,
  fetcher,
  pageSize = 10,
  enabled = true,
  dedupe = false,
  swrOptions = {},
}) => {
  const getKey = (pageIndex, previousPageData) => {
    if (!enabled) return null;
    if (previousPageData && (previousPageData.posts?.length ?? 0) < pageSize) return null;
    const keyArr = Array.isArray(key) ? key : [key];
    return [...keyArr, pageIndex + 1, pageSize];
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    (keyArr) => {
      const page = keyArr[keyArr.length - 2];
      const limit = keyArr[keyArr.length - 1];
      return fetcher(page, limit);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...swrOptions,
    }
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.posts?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.posts?.length < pageSize);

  let posts = data ? data.flatMap((page) => page.posts || []) : [];
  if (dedupe) {
    const seen = new Set();
    posts = posts.filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }

  const totalCount = data?.[0]?.totalCount || 0;
  const hasMore = totalCount > 0 && posts.length < totalCount;

  return {
    posts,
    totalCount,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    isEmpty,
    hasMore,
    isValidating,
  };
};
