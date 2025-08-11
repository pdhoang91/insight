// components/Utils/ViewMoreButton.js
import React from 'react';

export const ViewMoreButton = ({ onClick, className = '', children = 'see more' }) => {
  return (
    <button
      onClick={onClick}
      className={`mt-4 inline-block px-2 py-1 border border-gray-300 text-gray-500 text-sm rounded-full text-center transition-colors hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
};

export default ViewMoreButton;

