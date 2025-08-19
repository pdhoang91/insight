// hooks/usePost.js
import useSWR from 'swr';
import { getPostById, getPostByTitleName } from '../services/postService';

export const usePost = (postId) => {
  const { data , error, mutate } = useSWR(postId ? `/posts/${postId}` : null, () => getPostById(postId));

   return {
    post: data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const usePostName = (postName) => {
  const { data , error, mutate } = useSWR(postName ? `/p/${postName}` : null, () => getPostByTitleName(postName));

   return {
    post: data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

