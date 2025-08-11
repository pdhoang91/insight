// hooks/useInfiniteUserPosts.js
import useSWRInfinite from 'swr/infinite';
import { useUser } from '../context/UserContext';
import { fetchUserPosts, getUserPosts } from '../services/userService';
import { getPosts, getFollowingPosts } from '../services/postService';
import { getPostsByCategory } from '../services/categoryService';

export const useInfiniteUserPosts = (activeTab, username) => {
  const { user } = useUser();
  const PAGE_SIZE = 10; // Số lượng bài post mỗi trang

  // Fetcher function với async/await và định dạng lại dữ liệu trả về
  const fetcher = async (type, page, limit) => {
    try {
      if (type === 'posts' || type === 'YourPosts' || type === 'UserPosts') {
        // Handle user posts - use username to get specific user's posts
        const data = await fetchUserPosts(username, page, limit);
        return { posts: data.posts || data.data || [], totalCount: data.totalCount || data.total_count || 0 };
      } else if (type === 'ForYou') {
        const data = await getPosts(page, limit);
        return { posts: data.posts || data.data || [], totalCount: data.totalCount || data.total_count || 0 };
      } else if (type === 'Following') {
        const data = await getFollowingPosts(page, limit);
        return { posts: data.posts || data.data || [], totalCount: data.totalCount || data.total_count || 0 };
      } else {
        // Giả sử các tab bổ sung là các category
        const data = await getPostsByCategory(type, page, limit);
        return { posts: data.posts || data.data || [], totalCount: data.totalCount || data.total_count || 0 };
      }
    } catch (error) {
      console.error(`Error fetching ${type} posts for user ${username}:`, error);
      return { posts: [], totalCount: 0 }; // Return empty data on error
    }
  };

  // Hàm để tạo key cho mỗi trang
  const getKey = (pageIndex, previousPageData) => {
    // Don't fetch if username is undefined or empty (router not ready yet)
    if ((activeTab === 'posts' || activeTab === 'YourPosts' || activeTab === 'UserPosts') && (!username || username.trim() === '')) {
      return null;
    }

    // Nếu đã không còn dữ liệu để tải thêm, trả về null
    if (previousPageData && (previousPageData.posts?.length ?? 0) < PAGE_SIZE) return null;

    if (activeTab === 'YourPosts') {
      return ['YourPosts', pageIndex + 1, PAGE_SIZE, username]; // Include username in key
    } else if (activeTab === 'UserPosts') {
      return ['UserPosts', pageIndex + 1, PAGE_SIZE, username]; // Include username in key
    } else if (activeTab === 'posts') {
      return ['posts', pageIndex + 1, PAGE_SIZE, username]; // Include username in key
    } else if (activeTab === 'ForYou') {
      return ['ForYou', pageIndex + 1, PAGE_SIZE];
    } else if (activeTab === 'Following' && user) {
      return ['Following', pageIndex + 1, PAGE_SIZE];
    } else if (activeTab) {
      return [activeTab, pageIndex + 1, PAGE_SIZE];
    } else {
      return null;
    }
  };

  // Sử dụng useSWRInfinite để lấy dữ liệu
  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([type, page, limit]) => fetcher(type, page, limit),
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