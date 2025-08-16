// hooks/useClapsCount.js
import useSWR from 'swr';
import { getClapsCount } from '../services/activityService';

export const useClapsCount = (type, id) => {
  const key = `/claps?type=${type}&id=${id}`;
  const { data, error, mutate } = useSWR(
    key,
    () => getClapsCount(type, id)
  );

  // Log chỉ khi dữ liệu không phải là một số hoặc object chứa clap_count
  if (data && !(typeof data === 'number' || (typeof data === 'object' && typeof data.clap_count === 'number'))) {

  }



  let clapsCount = 0;
  if (typeof data === 'number') {
    clapsCount = data;
  } else if (typeof data === 'object' && typeof data.clap_count === 'number') {
    clapsCount = data.clap_count;
  }

  return {
    clapsCount,
    loading: !error && !data,
    isError: error,
    hasClapped: clapsCount > 0,
    mutate,
  };
};
