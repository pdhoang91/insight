

// // src/components/TimeAgo.js
// import React from 'react';

// // Hàm để tính khoảng thời gian từ một thời điểm nhất định
// export const timeAgo = (date) => {
//   const now = new Date();
//   const seconds = Math.floor((now - new Date(date)) / 1000);
//   let interval = Math.floor(seconds / 31536000);

//   if (interval >= 1) {
//     return `${interval} year${interval === 1 ? '' : 's'} ago`;
//   }
//   interval = Math.floor(seconds / 2592000);
//   if (interval >= 1) {
//     return `${interval} month${interval === 1 ? '' : 's'} ago`;
//   }
//   interval = Math.floor(seconds / 86400);
//   if (interval >= 1) {
//     return `${interval} day${interval === 1 ? '' : 's'} ago`;
//   }
//   interval = Math.floor(seconds / 3600);
//   if (interval >= 1) {
//     return `${interval} hour${interval === 1 ? '' : 's'} ago`;
//   }
//   interval = Math.floor(seconds / 60);
//   if (interval >= 1) {
//     return `${interval} minute${interval === 1 ? '' : 's'} ago`;
//   }
//   return 'just now';
// };

// // Component TimeAgo
// const TimeAgo = ({ timestamp }) => {
//   return (
//     <p className="text-sm text-gray-500 mt-1">{timeAgo(timestamp)}</p>
//   );
// };

// export default TimeAgo;

// src/components/TimeAgo.js
import React from 'react';

// Hàm để tính khoảng thời gian từ một thời điểm nhất định
export const timeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 86400);

  // Nếu thời gian đã quá 1 ngày, hiển thị định dạng "Oct 17, 2024"
  if (interval >= 1) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Các khoảng thời gian khác (theo giờ, phút, giây)
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour${interval === 1 ? '' : 's'} ago`;
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute${interval === 1 ? '' : 's'} ago`;
  }
  return 'just now';
};

// Component TimeAgo
const TimeAgo = ({ timestamp }) => {
  return (
    <p className="text-sm font-medium text-gray-600 mt-1 inline-flex items-center space-x-1">
      <span>{timeAgo(timestamp)}</span>
    </p>
  );
};

export default TimeAgo;

