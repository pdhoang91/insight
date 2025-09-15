// components/Shared/LoadingSpinner.js
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: themeClasses.icons.sm,
    md: themeClasses.icons.md,
    lg: themeClasses.icons.lg,
    xl: themeClasses.icons.xl
  };

  return (
    <div className={combineClasses(
      'inline-block',
      sizeClasses[size],
      className
    )}>
      <div className={combineClasses(
        'animate-spin rounded-full border-2',
        themeClasses.border.primary,
        'border-t-medium-accent-green'
      )}></div>
    </div>
  );
};

export default LoadingSpinner;