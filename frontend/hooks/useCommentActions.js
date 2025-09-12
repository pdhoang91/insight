// hooks/useCommentActions.js
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { clapPost } from '../services/activityService';

export const useCommentActions = (postId, mutateClaps) => {
  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }
    
    try {
      await clapPost(postId);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      mutateClaps();
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  return {
    isCommentsOpen,
    handleClap,
    toggleCommentPopup,
    closeCommentPopup,
    user
  };
};

export default useCommentActions;
