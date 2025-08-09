// components/Post/Rating.js
import React from 'react';
import { useRating } from '../../hooks/useRating';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ postId }) => {
  const { averageRating, hover, setHover, handleSubmitRating } = useRating(postId);

  const renderStar = (value) => {
    if (hover >= value) {
      return <FaStar />;
    } else if (!hover && averageRating >= value - 0.5) {
      if (averageRating >= value) {
        return <FaStar />;
      }
      return <FaStarHalfAlt />;
    } else {
      return <FaRegStar />;
    }
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          onClick={() => handleSubmitRating(value)}
          onMouseEnter={() => setHover(value)}
          onMouseLeave={() => setHover(0)}
          className={`cursor-pointer text-yellow-400 transition-transform duration-200 ${
            hover >= value ? 'scale-110' : 'scale-100'
          }`}
        >
          {renderStar(value)}
        </span>
      ))}
      {averageRating > 0 && (
        <span className="ml-2 text-gray-700 text-sm font-mono">
          {averageRating.toFixed(1)} / 5 
        </span>
      )}
    </div>
  );
};

export default Rating;

