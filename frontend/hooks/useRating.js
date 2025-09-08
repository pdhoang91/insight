// hooks/useRating.js
import { useState, useEffect } from 'react';

export const useRating = (postId) => {
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hover, setHover] = useState(0);

  // Mock implementation - replace with actual API calls
  useEffect(() => {
    if (postId) {
      // Simulate loading rating data
      setRating(4.2); // Mock average rating
      setUserRating(0); // Mock user rating (0 = not rated)
    }
  }, [postId]);

  const handleSubmitRating = async (newRating) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual implementation
      setUserRating(newRating);
      // Update average rating (simplified calculation)
      setRating((prev) => (prev + newRating) / 2);
    } catch (error) {
      console.error('Error rating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    averageRating: rating,
    userRating,
    isLoading,
    hover,
    setHover,
    handleSubmitRating
  };
};
