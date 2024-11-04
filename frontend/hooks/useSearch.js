// // hooks/useSearch.js


// hooks/useSearch.js
import useSWRInfinite from 'swr/infinite';
import {
  fetchStories,
  fetchPeople,
} from '../services/searchService';

export const useSearch = (query) => {
  const PAGE_SIZE = 10;
  const categories = ['stories', 'people'];

  // Tạo hàm getKey cho useSWRInfinite
  const getKey = (category) => (pageIndex, previousPageData) => {
    if (!query) return null; // Không fetch nếu không có query
    if (previousPageData && previousPageData.posts.length < PAGE_SIZE) {
      return null; // Ngừng fetch nếu đã tải hết
    }
    return { category, page: pageIndex + 1, limit: PAGE_SIZE };
  };


  const fetcher = async ({ category, page, limit }) => {
    try {
      let data;
      switch (category) {
        case 'stories':
          data = await fetchStories(query, page, limit);
          return { posts: data.posts, totalCount: data.totalCount };
        case 'people':
          data = await fetchPeople(query, page, limit);
          return { people: data.people, totalCount: data.totalCount }; // Sử dụng `people` thay vì `posts`
        default:
          return { posts: [], totalCount: 0 };
      }
    } catch (error) {
      console.error(`Error fetching data for ${category}:`, error);
      throw error;
    }
  };
  

  // Khởi tạo useSWRInfinite cho từng danh mục
  const swrResults = categories.map((category) =>
    useSWRInfinite(getKey(category), (key) => fetcher(key))
  );

  const data = {};
  const hasMore = {};
  const loadMore = (category) => {
    const index = categories.indexOf(category);
    if (index !== -1) {
      swrResults[index].setSize(swrResults[index].size + 1);
    }
  };

  // categories.forEach((category, index) => {
  //   const result = swrResults[index];
  //   data[category] = result.data ? result.data.flatMap((page) => page.posts) : [];
  //   hasMore[category] = result.data && result.data.length > 0
  //     ? result.data.some((page) => page.posts?.length === PAGE_SIZE)
  //     : false;
  // });

  categories.forEach((category, index) => {
    const result = swrResults[index];
    data[category] =
      category === 'people'
        ? result.data ? result.data.flatMap((page) => page.people) : [] // sửa thành people
        : result.data ? result.data.flatMap((page) => page.posts) : [];
    hasMore[category] =
      result.data && result.data.length > 0
        ? result.data.some((page) => page.posts?.length === PAGE_SIZE || page.people?.length === PAGE_SIZE)
        : false;
  });
  

  const isLoading = swrResults.some((result) => result.isValidating);
  const isError = swrResults.some((result) => result.error);

  return {
    data, // Bao gồm tất cả các loại dữ liệu
    isLoading,
    isError,
    loadMore,
    hasMore,
  };
};
