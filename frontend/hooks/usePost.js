// hooks/usePost.js
import useSWR from 'swr';
import { getPostById, getPostByName } from '../services/postService';

export const usePost = (postId) => {
  const { data , error, mutate } = useSWR(postId ? `/posts/${postId}` : null, () => getPostById(postId));


   return {
    post: data?.post ?? null,
    isLoading: !error && !data,
    isError: error,
    //hasBookmark, // Sử dụng biến đã kiểm tra
    mutate,
  };
};


export const usePostName = (postName) => {
  const { data , error, mutate } = useSWR(postName ? `/p/${postName}` : null, () => getPostByName(postName));


   return {
    post: data?.post ?? null,
    isLoading: !error && !data,
    isError: error,
    //hasBookmark, // Sử dụng biến đã kiểm tra
    mutate,
  };
};

