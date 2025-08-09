import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/user.service';

interface FollowState {
  isFollowing: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useFollow = (userId: string) => {
  const [state, setState] = useState<FollowState>({
    isFollowing: false,
    isLoading: false,
    error: null,
  });

  const checkFollowStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await userService.checkIsFollowing(userId);
      setState(prev => ({ ...prev, isFollowing: response.data }));
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  }, [userId]);

  const toggleFollow = useCallback(async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      let response;
      if (state.isFollowing) {
        response = await userService.unfollowUser(userId);
      } else {
        response = await userService.followUser(userId);
      }
      
      setState(prev => ({
        ...prev,
        isFollowing: response.data.following,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle follow';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [userId, state.isFollowing]);

  const followUser = useCallback(async () => {
    if (!userId || state.isFollowing) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await userService.followUser(userId);
      setState(prev => ({
        ...prev,
        isFollowing: response.data.following,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to follow user';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [userId, state.isFollowing]);

  const unfollowUser = useCallback(async () => {
    if (!userId || !state.isFollowing) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await userService.unfollowUser(userId);
      setState(prev => ({
        ...prev,
        isFollowing: response.data.following,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unfollow user';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [userId, state.isFollowing]);

  const mutate = useCallback(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  useEffect(() => {
    if (userId) {
      checkFollowStatus();
    }
  }, [checkFollowStatus, userId]);

  return {
    isFollowing: state.isFollowing,
    loading: state.isLoading,
    error: state.error,
    toggleFollow,
    followUser,
    unfollowUser,
    mutate,
  };
};

export default useFollow; 