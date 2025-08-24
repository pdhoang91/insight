// hooks/usePostComments.js
import { useState } from 'react';
import { addComment } from '../services/commentService';
import { useUser } from '../context/UserContext';
import { useInfiniteComments } from './useInfiniteComments';
import { useComments } from './useComments';

export const usePostComments = (postId, useInfinite = false, pageSize = 2) => {
  const { user } = useUser();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Choose between infinite or regular comments hook
  const commentsHook = useInfinite 
    ? useInfiniteComments(postId, isCommentsOpen, pageSize)
    : useComments(postId, isCommentsOpen, 1, 10);

  const {
    comments,
    totalCount,
    totalCommentReply,
    isLoading,
    isError,
    canLoadMore,
    loadMore,
    mutate
  } = commentsHook;

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận.');
      return false;
    }

    if (!content.trim()) {
      alert('Nội dung bình luận không thể để trống.');
      return false;
    }

    try {
      await addComment(postId, content);
      mutate(); // Refresh comments
      return true;
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Không thể thêm bình luận. Vui lòng thử lại.');
      return false;
    }
  };

  const toggleComments = () => {
    setIsCommentsOpen(prev => !prev);
  };

  const closeComments = () => {
    setIsCommentsOpen(false);
  };

  const openComments = () => {
    setIsCommentsOpen(true);
  };

  return {
    // State
    isCommentsOpen,
    
    // Data
    comments,
    totalCount,
    totalCommentReply,
    isLoading,
    isError,
    canLoadMore,
    
    // Actions
    handleAddComment,
    toggleComments,
    closeComments,
    openComments,
    loadMore,
    mutate,
  };
};
