// hooks/useInfiniteComments.js
import useSWRInfinite from 'swr/infinite';
import { getCommentsForPost } from '../services/commentService';

export const useInfiniteComments = (postId, isEnabled = true, pageSize = 2) => {
  const getKey = (pageIndex, previousPageData) => {
    // Don't fetch if not enabled
    if (!isEnabled || !postId) return null;
    
    // First page, always fetch
    if (pageIndex === 0) return `/posts/${postId}/comments?page=1&limit=${pageSize}`;
    
    // Stop if previous page has no data or less than pageSize items
    if (!previousPageData || !previousPageData.data || previousPageData.data.length < pageSize) {
      return null;
    }
    
    return `/posts/${postId}/comments?page=${pageIndex + 1}&limit=${pageSize}`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(
    getKey,
    (key) => {
      const url = new URL(key, 'http://localhost');
      const page = url.searchParams.get('page');
      const limit = url.searchParams.get('limit');
      return getCommentsForPost(postId, parseInt(page), parseInt(limit));
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const isLoading = !data && !error;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  
  // Flatten all comments from all pages
  const comments = data 
    ? data
        .map(page => page.data || [])
        .flat()
        .filter((item, index, self) => 
          self.findIndex(i => i.id === item.id) === index
        )
    : [];

  // Check if we can load more
  const canLoadMore = data && data.length > 0 && data[data.length - 1]?.data?.length === pageSize;
  
  // Get total counts from the first page
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;
  const totalCommentReply = data && data.length > 0 ? data[0].totalCommentReply : 0;

  const loadMore = () => {
    if (canLoadMore && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  return {
    comments,
    totalCount,
    totalCommentReply,
    isLoading: isLoadingMore,
    isError: error,
    canLoadMore,
    loadMore,
    mutate,
  };
}; 