

// // src/components/TimeAgo.js
// src/components/TimeAgo.js
import React from 'react';

// Hàm để tính khoảng thời gian từ một thời điểm nhất định
export const timeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);

  // Kiểm tra nếu thời gian đã vượt quá 1 ngày
  if (seconds >= 86400) {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    return `${month} ${day}`; // Ensures the date is rendered in one line
  }

  // Các khoảng thời gian khác (theo giờ, phút, giây)
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  return 'just now';
};

// Component TimeAgo
const TimeAgo = ({ timestamp }) => {
  return (
    <span
      className="text-sm text-gray-600 inline-flex items-center space-x-1"
      style={{ fontFamily: 'inherit' }} // Ensures consistent font-family
    >
      <span>{timeAgo(timestamp)}</span>
    </span>
  );
};

export default TimeAgo;
