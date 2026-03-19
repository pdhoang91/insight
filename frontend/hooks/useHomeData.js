import useSWR from 'swr';
import { fetchHomeData } from '../app/lib/api';

export const useHomeData = (initialData = null) => {
  const { data, error, mutate } = useSWR(
    '/home',
    fetchHomeData,
    {
      fallbackData: initialData,
      revalidateOnMount: !initialData,
      revalidateOnFocus: false,
      dedupingInterval: 120000,
    }
  );

  return {
    homeData: data,
    latestPosts: data?.latest_posts || [],
    popularPosts: data?.popular_posts || [],
    categories: data?.categories || [],
    totalPosts: data?.total_posts || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
