// hooks/useClapsCount.js
import useSWR from 'swr';
import { getClapInfo } from '../services/activityService';

export const useClapsCount = (type, id) => {
  const clapInfoKey = id ? `/claps/info?type=${type}&id=${id}` : null;
  
  const { data: clapInfo, error, mutate } = useSWR(
    clapInfoKey,
    () => getClapInfo(type, id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache clap info for 30 seconds
      errorRetryCount: 1,
      errorRetryInterval: 2000,
    }
  );

  const clapsCount = clapInfo?.clapCount || 0;
  const hasClapped = clapInfo?.hasClapped || false;

  return {
    clapsCount,
    loading: !error && !clapInfo,
    isError: error,
    hasClapped,
    mutate,
  };
};
