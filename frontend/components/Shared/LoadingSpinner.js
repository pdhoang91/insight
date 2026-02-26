// components/Shared/LoadingSpinner.js
import React from 'react';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div className={`inline-block ${sizeMap[size] || sizeMap.md} ${className}`}>
    <div className="w-full h-full animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#1a8917]" />
  </div>
);

export default LoadingSpinner;
