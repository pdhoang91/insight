// components/Reading/ReadingStats.js
import React from 'react';
import { FaClock, FaEye } from 'react-icons/fa';

const ReadingStats = ({ 
  readingTime, 
  timeRemaining, 
  viewCount = 0, 
  showTimeRemaining = false,
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-4 text-sm text-medium-text-muted ${className}`}>
      {/* Reading Time */}
      <div className="flex items-center space-x-1">
        <FaClock className="w-3 h-3" />
        <span>
          {showTimeRemaining && timeRemaining > 0 
            ? `${timeRemaining} min left`
            : `${readingTime} min read`
          }
        </span>
      </div>

      {/* View Count */}
      {viewCount > 0 && (
        <>
          <span className="text-medium-divider">·</span>
          <div className="flex items-center space-x-1">
            <FaEye className="w-3 h-3" />
            <span>{viewCount.toLocaleString()} views</span>
          </div>
        </>
      )}

      {/* Published Date */}
      <span className="text-medium-divider">·</span>
      <span>Published in Insight</span>
    </div>
  );
};

export default ReadingStats;
