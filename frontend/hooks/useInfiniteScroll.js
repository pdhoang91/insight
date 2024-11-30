// hooks/useInfiniteScroll.js
import useSWRInfinite from 'swr/infinite';

export const useInfiniteScroll = ({
  fetchFn,
  pageSize = 10,
  initialData = null,
  dependencyKey = '',
}) => {
  const getKey = (pageIndex, previousPageData) => {
    // First page, always fetch
    if (pageIndex === 0) return [dependencyKey, pageIndex + 1, pageSize];
    
    // Stop if previous page has no data
    if (!previousPageData || previousPageData.data?.length === 0) {
      return null;
    }
    
    return [dependencyKey, pageIndex + 1, pageSize];
  };

  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([key, page, limit]) => fetchFn(page, limit)
  );

  const isLoading = !data && !error;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < pageSize);

  const items = data 
    ? data
        .map(page => page.data || [])
        .flat()
        .filter((item, index, self) => 
          self.findIndex(i => i.id === item.id) === index
        )
    : [];

  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  return {
    items,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    totalCount,
  };
};