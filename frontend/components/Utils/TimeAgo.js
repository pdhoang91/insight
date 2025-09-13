

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
    return `${hours} giờ trước`;
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} phút trước`;
  }

  return 'vừa xong';
};

// Component TimeAgo
const TimeAgo = ({ timestamp }) => {
  return (
    <span
      className="text-body-small text-medium-text-secondary inline-flex items-center space-x-1"
      style={{ fontFamily: 'inherit' }} // Ensures consistent font-family
    >
      <span>{timeAgo(timestamp)}</span>
    </span>
  );
};

export default TimeAgo;
