// hooks/useArchivePosts.js
import { getPostsByYearMonth } from '../services/postService';
import { useInfiniteList } from './useInfiniteList';

export const useArchivePosts = (year, month) => {
  const result = useInfiniteList({
    key: ['archive', year, month],
    fetcher: (page, limit) => getPostsByYearMonth(year, month, page, limit),
    pageSize: 20,
    enabled: !!year && !!month,
    swrOptions: { dedupingInterval: 5 * 60 * 1000 },
  });

  return result;
};

export default useArchivePosts;
