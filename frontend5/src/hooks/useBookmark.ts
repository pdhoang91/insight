import { useState, useEffect, useCallback } from 'react';
import { bookmarkService } from '@/services/bookmark.service';

interface BookmarkState {
  isBookmarked: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useBookmark = (postId: string) => {
  const [state, setState] = useState<BookmarkState>({
    isBookmarked: false,
    isLoading: false,
    error: null,
  });

  const checkBookmarkStatus = useCallback(async () => {
    if (!postId) return;

    try {
      const response = await bookmarkService.isBookmarked(postId);
      setState(prev => ({ ...prev, isBookmarked: response.data }));
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    }
  }, [postId]);

  const toggleBookmark = useCallback(async () => {
    if (!postId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      let response;
      if (state.isBookmarked) {
        response = await bookmarkService.unbookmarkPost(postId);
      } else {
        response = await bookmarkService.bookmarkPost(postId);
      }
      
      setState(prev => ({
        ...prev,
        isBookmarked: response.data.bookmarked,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle bookmark';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [postId, state.isBookmarked]);

  const mutate = useCallback(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  useEffect(() => {
    if (postId) {
      checkBookmarkStatus();
    }
  }, [checkBookmarkStatus, postId]);

  return {
    isBookmarked: state.isBookmarked,
    loading: state.isLoading,
    error: state.error,
    toggleBookmark,
    mutate,
  };
};

export default useBookmark; 