// hooks/useClapsCount.js
import useSWR from 'swr';
import { getClapInfo } from '../services/activityService';

export const useClapsCount = (type, id) => {
  const clapInfoKey = `/claps/info?type=${type}&id=${id}`;
  
  const { data: clapInfo, error, mutate } = useSWR(
    clapInfoKey,
    () => getClapInfo(type, id)
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
