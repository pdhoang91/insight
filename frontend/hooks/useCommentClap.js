// hooks/useCommentClap.js
import { useState } from 'react';
import { clapComment } from '../services/activityService';
import { useUser } from '../context/UserContext';
import { useClapsCount } from './useClapsCount';

export const useCommentClap = (commentId, initialClapCount = 0) => {
  const { user } = useUser();
  const [clapsInitialized, setClapsInitialized] = useState(false);
  
  // Only fetch clap data when initialized
  const { clapsCount, loading: clapsLoading, hasClapped, mutate: mutateClaps } = 
    useClapsCount('comment', clapsInitialized ? commentId : null);

  const handleClap = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để vỗ tay.');
      return false;
    }

    // Initialize claps data if not already done
    if (!clapsInitialized) {
      setClapsInitialized(true);
      // Wait a bit for the hook to initialize, then retry
      setTimeout(() => {
        handleClap();
      }, 100);
      return false;
    }

    try {
      await clapComment(commentId);
      mutateClaps();
      return true;
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Không thể vỗ tay. Vui lòng thử lại.');
      return false;
    }
  };

  // Return the appropriate clap count
  const displayClapCount = clapsInitialized ? clapsCount : initialClapCount;

  return {
    clapsCount: displayClapCount,
    clapsLoading,
    hasClapped,
    handleClap,
    clapsInitialized,
  };
};
