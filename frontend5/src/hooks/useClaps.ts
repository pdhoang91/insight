import { useState, useEffect, useCallback } from 'react';
import { postService } from '@/services/post.service';

interface ClapsState {
  clapsCount: number;
  hasClapped: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useClapsCount = (type: 'post' | 'comment', id: string) => {
  const [state, setState] = useState<ClapsState>({
    clapsCount: 0,
    hasClapped: false,
    isLoading: false,
    error: null,
  });

  const checkClapStatus = useCallback(async () => {
    if (!id || type !== 'post') return;

    try {
      const response = await postService.checkHasClapped(id);
      setState(prev => ({ ...prev, hasClapped: response.data }));
    } catch (error) {
      console.error('Failed to check clap status:', error);
    }
  }, [id, type]);

  const clapPost = useCallback(async () => {
    if (!id || type !== 'post') return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await postService.clapPost(id);
      setState(prev => ({
        ...prev,
        hasClapped: response.data.clapped,
        clapsCount: response.data.clapsCount,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clap post';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [id, type]);

  const mutate = useCallback(() => {
    checkClapStatus();
  }, [checkClapStatus]);

  useEffect(() => {
    if (id && type === 'post') {
      checkClapStatus();
    }
  }, [checkClapStatus, id, type]);

  return {
    clapsCount: state.clapsCount,
    hasClapped: state.hasClapped,
    loading: state.isLoading,
    error: state.error,
    clapPost,
    mutate,
  };
};

// Alternative hook name for consistency
export const useClaps = useClapsCount; 