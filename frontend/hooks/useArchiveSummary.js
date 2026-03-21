// hooks/useArchiveSummary.js
import useSWR from 'swr';
import { getArchiveSummary } from '../services/postService';

export const useArchiveSummary = () => {
  const { data, error } = useSWR('archive-summary', getArchiveSummary, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    archiveList: data || [],
    isLoading: !error && !data,
    isError: !!error,
  };
};

export default useArchiveSummary;
