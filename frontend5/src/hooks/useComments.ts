import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';
import { commentService } from '@/services/comment.service';

interface CommentsState {
  comments: Comment[];
  totalCount: number;
  totalCommentReply: number;
  isLoading: boolean;
  error: string | null;
}

export const useComments = (postId: string, autoFetch = true, page = 1, limit = 10) => {
  const [state, setState] = useState<CommentsState>({
    comments: [],
    totalCount: 0,
    totalCommentReply: 0,
    isLoading: true,
    error: null,
  });

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await commentService.getComments(postId, page, limit);
      
      setState(prev => ({
        ...prev,
        comments: response.data,
        totalCount: response.pagination.totalItems,
        totalCommentReply: response.totalCommentReply,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, [postId, page, limit]);

  const createComment = useCallback(async (content: string, parentId?: string) => {
    if (!postId) return;

    try {
      await commentService.createComment(postId, content, parentId);
      // Refresh comments after creating
      await fetchComments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [postId, fetchComments]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      await commentService.updateComment(commentId, content);
      // Refresh comments after updating
      await fetchComments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [fetchComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      // Refresh comments after deleting
      await fetchComments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [fetchComments]);

  const mutate = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (autoFetch && postId) {
      fetchComments();
    }
  }, [autoFetch, fetchComments, postId]);

  return {
    comments: state.comments,
    totalCount: state.totalCount,
    totalCommentReply: state.totalCommentReply,
    isLoading: state.isLoading,
    isError: !!state.error,
    error: state.error,
    createComment,
    updateComment,
    deleteComment,
    mutate,
    refetch: fetchComments,
  };
};

export const useCommentReplies = (commentId: string, page = 1, limit = 5) => {
  const [state, setState] = useState({
    replies: [] as Comment[],
    totalCount: 0,
    isLoading: false,
    error: null as string | null,
  });

  const fetchReplies = useCallback(async () => {
    if (!commentId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await commentService.getReplies(commentId, page, limit);
      
      setState(prev => ({
        ...prev,
        replies: response.data,
        totalCount: response.pagination.totalItems,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch replies';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, [commentId, page, limit]);

  const mutate = useCallback(() => {
    fetchReplies();
  }, [fetchReplies]);

  return {
    replies: state.replies,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    isError: !!state.error,
    error: state.error,
    mutate,
    refetch: fetchReplies,
  };
};

export const useCommentLike = (commentId: string) => {
  const [state, setState] = useState({
    liked: false,
    likesCount: 0,
    isLoading: false,
  });

  const checkLikeStatus = useCallback(async () => {
    if (!commentId) return;

    try {
      const response = await commentService.checkHasLiked(commentId);
      setState(prev => ({ ...prev, liked: response.data }));
    } catch (error) {
      console.error('Failed to check like status:', error);
    }
  }, [commentId]);

  const toggleLike = useCallback(async () => {
    if (!commentId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await commentService.likeComment(commentId);
      setState(prev => ({
        ...prev,
        liked: response.data.liked,
        likesCount: response.data.likesCount,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [commentId]);

  useEffect(() => {
    if (commentId) {
      checkLikeStatus();
    }
  }, [checkLikeStatus, commentId]);

  return {
    liked: state.liked,
    likesCount: state.likesCount,
    isLoading: state.isLoading,
    toggleLike,
    mutate: checkLikeStatus,
  };
}; 