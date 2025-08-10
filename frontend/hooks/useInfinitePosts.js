// hooks/useInfinitePosts.js
import useSWRInfinite from 'swr/infinite';
import { getPosts } from '../services/postService';

export const useInfinitePosts = () => {
  const PAGE_SIZE = 10; // Số lượng bài post mỗi trang

  // Fetcher function - chỉ sử dụng getPosts
  const fetcher = async (page, limit) => {
    try {
      const data = await getPosts(page, limit);
      return { posts: data.posts, totalCount: data.totalCount };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  // Xác định key cho mỗi trang
  const getKey = (pageIndex, previousPageData) => {
    // Nếu đã không còn dữ liệu để tải thêm, trả về null
    if (previousPageData && (previousPageData.posts?.length ?? 0) < PAGE_SIZE) return null;
    
    return ['posts', pageIndex + 1, PAGE_SIZE];
  };

  // Sử dụng useSWRInfinite để lấy dữ liệu
  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([, page, limit]) => fetcher(page, limit)
  );

  // Các trạng thái loading và error
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.posts?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.posts?.length < PAGE_SIZE);

  // Kết hợp tất cả các trang thành một mảng duy nhất
  const posts = data ? data.map(page => page.posts || []).flat() : [];
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  return {
    posts,
    isLoading: isLoadingMore,
    isError: error,
    size,
    setSize,
    isReachingEnd,
    totalCount,
  };
};
