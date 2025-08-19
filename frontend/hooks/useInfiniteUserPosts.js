// hooks/useInfiniteUserPosts.js
import useSWRInfinite from 'swr/infinite';
import { fetchUserPosts } from '../services/userService';

export const useInfiniteUserPosts = (username) => {
  const PAGE_SIZE = 10; // Số lượng bài post mỗi trang

  // Fetcher function để lấy posts của user
  const fetcher = async (page, limit) => {
    try {
      const data = await fetchUserPosts(username, page, limit);
      return { posts: data.posts || data.data || [], totalCount: data.totalCount || data.total_count || 0 };
    } catch (error) {
      console.error(`Error fetching posts for user ${username}:`, error);
      return { posts: [], totalCount: 0 }; // Return empty data on error
    }
  };

  // Hàm để tạo key cho mỗi trang
  const getKey = (pageIndex, previousPageData) => {
    // Don't fetch if username is undefined or empty (router not ready yet)
    if (!username || username.trim() === '') {
      return null;
    }

    // Nếu đã không còn dữ liệu để tải thêm, trả về null
    if (previousPageData && (previousPageData.posts?.length ?? 0) < PAGE_SIZE) return null;

    return ['userPosts', pageIndex + 1, PAGE_SIZE, username];
  };

  // Sử dụng useSWRInfinite để lấy dữ liệu
  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([, page, limit]) => fetcher(page, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    }
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