// hooks/useReadingList.js
import useSWR from 'swr';
import { getReadingList } from '../services/bookmarkService';


export const useReadingList = (page = 1, limit = 10) => {
  const { data, error } = useSWR(
    [`/api/bookmarks`, page, limit],
    () => getReadingList(page, limit)
  );

  return {
    posts: data ? data.data : [],
    totalCount: data ? data.total_count : 0,
    isLoading: !error && !data,
    isError: error,
  };
};
