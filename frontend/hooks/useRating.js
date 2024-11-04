// hooks/useRating.js
import { useState, useEffect } from 'react';
import { submitRating, getAverageRating } from '../services/ratingService';
import { useUser } from '../context/UserContext';

export const useRating = (postId) => {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    const fetchAverage = async () => {
      try {
        const avg = await getAverageRating(postId);
        setAverageRating(avg);
        //setRating(avg); // Đặt rating mặc định là điểm trung bình
      } catch (error) {
        console.error("Failed to fetch average rating", error);
      }
    };

    fetchAverage();
  }, [postId]);

  const handleSubmitRating = async (value) => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }

    try {
      await submitRating(postId, value);
      setRating(value);
      // Có thể cập nhật lại averageRating nếu cần
      const newAvg = await getAverageRating(postId);
      setAverageRating(newAvg);
    } catch (error) {
      console.error("Failed to submit rating", error);
    }
  };

  return {
    rating,
    averageRating,
    hover,
    setHover,
    handleSubmitRating,
  };
};
