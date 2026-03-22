// hooks/useInfiniteCursor.js
// Generic hook for cursor-based infinite scroll pagination.
// Replaces the ~85% identical logic in useInfiniteComments and useCommentReplies.
import useSWRInfinite from 'swr/infinite';

/**
 * @param {object} options
 * @param {string}   options.resourceUrl  - URL path prefix, e.g. `/posts/${postId}/comments`
 * @param {Function} options.fetcher      - async (cursor: string|null, limit: number) => { data: [], nextCursor, totalCount }
 * @param {number}   [options.pageSize=10]
 * @param {boolean}  [options.enabled=true]
 * @param {string}   [options.itemsKey='data'] - key in each page response that holds the items array
 * @param {boolean}  [options.dedupe=false]    - deduplicate by `id` using a Set (O(n))
 * @param {object}   [options.swrOptions={}]
 */
export const useInfiniteCursor = ({
  resourceUrl,
  fetcher,
  pageSize = 10,
  enabled = true,
  itemsKey = 'data',
  dedupe = false,
  swrOptions = {},
}) => {
  const getKey = (pageIndex, previousPageData) => {
    if (!enabled) return null;
    if (pageIndex === 0) return `${resourceUrl}?limit=${pageSize}`;
    if (!previousPageData || previousPageData.nextCursor === null) return null;
    return `${resourceUrl}?cursor=${previousPageData.nextCursor}&limit=${pageSize}`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(
    getKey,
    (key) => {
      const url = new URL(key, 'http://localhost');
      const cursor = url.searchParams.get('cursor');
      const limit = parseInt(url.searchParams.get('limit') || String(pageSize));
      return fetcher(cursor, limit);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 15000,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      ...swrOptions,
    }
  );

  const isLoading =
    (!data && !error) || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const canLoadMore =
    data && data.length > 0 && data[data.length - 1]?.nextCursor !== null;
  const totalCount = data?.[0]?.totalCount || 0;

  let items = data ? data.flatMap((page) => page[itemsKey] || []) : [];
  if (dedupe) {
    const seen = new Set();
    items = items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  const loadMore = () => {
    if (canLoadMore && !isLoading) setSize(size + 1);
  };

  return { items, isLoading, isError: error, canLoadMore, loadMore, mutate, totalCount };
};
