import { useState, useEffect, useCallback } from 'react';
import { Post, PaginatedResponse, SearchFilters } from '@/types';
import { postService } from '@/services/post.service';

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Post>['pagination'] | null;
}

export const usePosts = (initialPage = 1, initialLimit = 10, initialFilters?: SearchFilters) => {
  const [state, setState] = useState<PostsState>({
    posts: [],
    isLoading: true,
    error: null,
    pagination: null,
  });

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<SearchFilters | undefined>(initialFilters);

  const fetchPosts = useCallback(async (currentPage: number, currentLimit: number, currentFilters?: SearchFilters) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await postService.getPosts(currentPage, currentLimit, currentFilters);
      
      setState(prev => ({
        ...prev,
        posts: response.data,
        pagination: response.pagination,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, []);

  // Fetch posts when dependencies change
  useEffect(() => {
    fetchPosts(page, limit, filters);
  }, [page, limit, filters, fetchPosts]);

  const refetch = useCallback(() => {
    fetchPosts(page, limit, filters);
  }, [fetchPosts, page, limit, filters]);

  const nextPage = useCallback(() => {
    if (state.pagination?.hasNext) {
      setPage(prev => prev + 1);
    }
  }, [state.pagination?.hasNext]);

  const prevPage = useCallback(() => {
    if (state.pagination?.hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [state.pagination?.hasPrev]);

  const goToPage = useCallback((newPage: number) => {
    if (state.pagination && newPage >= 1 && newPage <= state.pagination.totalPages) {
      setPage(newPage);
    }
  }, [state.pagination]);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(undefined);
    setPage(1);
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  return {
    // State
    posts: state.posts,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,
    
    // Current filters and pagination
    currentPage: page,
    currentLimit: limit,
    currentFilters: filters,
    
    // Actions
    refetch,
    nextPage,
    prevPage,
    goToPage,
    updateFilters,
    clearFilters,
    updateLimit,
  };
};

export const usePost = (id?: string, slug?: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id && !slug) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await postService.getPost(id || '', slug);
      
      setPost(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id, slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const refetch = useCallback(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    isLoading,
    error,
    refetch,
  };
};

export const useFeaturedPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await postService.getFeaturedPosts();
      setPosts(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch featured posts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedPosts();
  }, [fetchFeaturedPosts]);

  const refetch = useCallback(() => {
    fetchFeaturedPosts();
  }, [fetchFeaturedPosts]);

  return {
    posts,
    isLoading,
    error,
    refetch,
  };
};

export const useRelatedPosts = (postId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedPosts = useCallback(async () => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await postService.getRelatedPosts(postId);
      setPosts(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch related posts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchRelatedPosts();
  }, [fetchRelatedPosts]);

  const refetch = useCallback(() => {
    fetchRelatedPosts();
  }, [fetchRelatedPosts]);

  return {
    posts,
    isLoading,
    error,
    refetch,
  };
}; 