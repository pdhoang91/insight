// components/UI/Loading.js - Medium 2024 Design
import React from 'react';

// Spinner Component
export const Spinner = ({ 
  size = 'md', 
  color = 'current',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    current: 'text-current',
    primary: 'text-medium-accent-green',
    secondary: 'text-medium-text-secondary',
    white: 'text-white'
  };

  return (
    <svg 
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  );
};

// Skeleton Component
export const Skeleton = ({ 
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  className = '',
  animate = true
}) => {
  const variants = {
    circular: 'rounded-full',
    rectangular: 'rounded-medium',
    text: 'rounded-sm'
  };

  const animateClass = animate ? 'animate-pulse' : '';

  return (
    <div 
      className={`bg-medium-bg-secondary ${variants[variant]} ${animateClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

// Loading Card Skeleton
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-medium-bg-card rounded-card border border-medium-border p-6 ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton variant="circular" width="3rem" height="3rem" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="40%" height="0.875rem" />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton width="75%" height="1rem" />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <Skeleton width="4rem" height="2rem" />
          <Skeleton width="6rem" height="2rem" />
        </div>
      </div>
    </div>
  );
};

// Post Item Skeleton
export const PostSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-medium-bg-card rounded-card border border-medium-border p-6 ${className}`}>
      <div className="animate-pulse">
        {/* Title */}
        <div className="mb-4">
          <Skeleton width="85%" height="1.5rem" className="mb-2" />
          <Skeleton width="60%" height="1.5rem" />
        </div>
        
        {/* Meta */}
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton variant="circular" width="2rem" height="2rem" />
          <Skeleton width="8rem" height="0.875rem" />
          <Skeleton width="4rem" height="0.875rem" />
        </div>
        
        {/* Content */}
        <div className="space-y-2 mb-4">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="95%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-6">
          <Skeleton width="4rem" height="2rem" />
          <Skeleton width="4rem" height="2rem" />
          <Skeleton width="4rem" height="2rem" />
        </div>
      </div>
    </div>
  );
};

// Loading Screen
export const LoadingScreen = ({ 
  message = "Loading...",
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <Spinner size="xl" color="primary" className="mb-4" />
      <p className="text-medium-text-secondary font-ui">{message}</p>
    </div>
  );
};

// Inline Loading
export const InlineLoading = ({ 
  message = "Loading...",
  size = 'sm',
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Spinner size={size} color="current" />
      <span className="text-medium-text-secondary text-sm">{message}</span>
    </div>
  );
};

// Button Loading State
export const ButtonLoading = ({ size = 'sm' }) => {
  return <Spinner size={size} color="current" className="-ml-1 mr-2" />;
};

export default {
  Spinner,
  Skeleton,
  CardSkeleton,
  PostSkeleton,
  LoadingScreen,
  InlineLoading,
  ButtonLoading
};
