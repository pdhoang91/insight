// hooks/usePost.js
import useSWR from 'swr';
import { getPostById, getPostBySlug } from '../services/postService';

export const usePost = (postId) => {
  const { data , error, mutate } = useSWR(postId ? `/posts/${postId}` : null, () => getPostById(postId));

   return {
    post: data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const usePostName = (slug) => {
  const { data , error, mutate } = useSWR(slug ? `/p/${slug}` : null, () => getPostBySlug(slug));

   return {
    post: data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
