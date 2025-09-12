// hooks/useArchivePosts.js
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getPostsByYearMonth } from '../services/postService';

export const useArchivePosts = (year, month, initialPage = 1, limit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, error, isLoading, mutate } = useSWR(
    year && month ? [`archive-${year}-${month}`, page, limit] : null,
    () => getPostsByYearMonth(year, month, page, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Reset when year/month changes
  useEffect(() => {
    if (year && month) {
      setPage(1);
      setAllPosts([]);
      setHasMore(true);
    }
  }, [year, month]);

  // Update posts when data changes
  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllPosts(data.posts);
      } else {
        setAllPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(data.hasMore);
    }
  }, [data, page]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    setAllPosts([]);
    setHasMore(true);
    mutate();
  };

  return {
    posts: allPosts,
    totalCount: data?.totalCount || 0,
    year: data?.year || year,
    month: data?.month || month,
    isLoading,
    isError: error,
    hasMore,
    loadMore,
    refresh,
    mutate,
  };
};

export default useArchivePosts;
