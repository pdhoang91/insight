// hooks/usePostClap.js
import { useState } from 'react';
import { clapPost } from '../services/activityService';
import { useUser } from '../context/UserContext';

export const usePostClap = (initialClapCount = 0) => {
  const { user } = useUser();
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(initialClapCount);

  const handleClap = async (postId) => {
    if (!user) {
      alert('Vui lòng đăng nhập để vỗ tay.');
      return false;
    }

    if (clapLoading) return false;

    setClapLoading(true);
    try {
      await clapPost(postId);
      setCurrentClapCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Không thể vỗ tay. Vui lòng thử lại.');
      return false;
    } finally {
      setClapLoading(false);
    }
  };

  // Reset clap count when initial value changes (for different posts)
  const resetClapCount = (newCount) => {
    setCurrentClapCount(newCount);
  };

  return {
    currentClapCount,
    clapLoading,
    handleClap,
    resetClapCount,
  };
};
