// hooks/useInfinitePostByCategory.js
import useSWRInfinite from 'swr/infinite';
import { getPostsByCategory } from '../services/categoryService';

export const useInfinitePostByCategory = (name) => {
  const PAGE_SIZE = 10; // Số lượng bài post mỗi trang

  // Fetcher function với async/await và định dạng lại dữ liệu trả về
  const fetcher = async (page, limit) => {
    try {
      const data = await getPostsByCategory(name, page, limit);
      //console.log('Fetched Data:', data);
      return { posts: data.posts, totalCount: data.totalCount };
    } catch (error) {
      console.error(`Error fetching posts for category "${name}":`, error);
      throw error;
    }
  };

  // Định nghĩa hàm getKey cho useSWRInfinite
  const getKey = (pageIndex, previousPageData) => {
    // Nếu không còn dữ liệu để tải thêm, trả về null
    if (previousPageData && previousPageData.posts.length === 0) return null;
    // Trả về một mảng chứa số trang và giới hạn
    return [pageIndex + 1, PAGE_SIZE];
  };

  // Sử dụng useSWRInfinite để lấy dữ liệu
  const { data, error, size, setSize } = useSWRInfinite(
    getKey,
    ([page, limit]) => fetcher(page, limit)
  );

  // Logging để kiểm tra dữ liệu
  // console.log('useInfinitePosts data:', data);
  // console.log('useInfinitePosts error:', error);
  // console.log('useInfinitePosts size:', size);

  // Các trạng thái loading và error
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.posts?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.posts?.length < PAGE_SIZE);

  // Kết hợp tất cả các trang thành một mảng duy nhất và loại bỏ trùng lặp
  const posts = data
    ? data
        .map(page => page.posts || [])
        .flat()
        .filter((post, index, self) => self.findIndex(p => p.id === post.id) === index)
    : [];
  const totalCount = data && data.length > 0 ? data[0].totalCount : 0;

  // Logging thêm
  console.log('Combined posts:', posts);
  console.log('Total count:', totalCount);
  console.log('Is reaching end:', isReachingEnd);

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
