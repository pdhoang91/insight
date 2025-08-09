'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width : '1rem'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%', // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Blog Card Skeleton
export const BlogCardSkeleton: React.FC<{ variant?: 'default' | 'featured' | 'compact' }> = ({ 
  variant = 'default' 
}) => {
  const cardClasses = {
    default: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
    featured: "bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden",
    compact: "bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
  };

  const imageHeight = {
    default: 'h-48',
    featured: 'h-64 md:h-80',
    compact: 'h-32'
  };

  const padding = {
    default: 'p-6',
    featured: 'p-8',
    compact: 'p-4'
  };

  return (
    <div className={cardClasses[variant]}>
      {/* Image Skeleton */}
      <Skeleton variant="rectangular" className={`w-full ${imageHeight[variant]}`} />
      
      <div className={padding[variant]}>
        {/* Categories Skeleton */}
        <div className="flex gap-2 mb-3">
          <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
          <Skeleton variant="rectangular" width={80} height={20} className="rounded-full" />
        </div>

        {/* Title Skeleton */}
        <Skeleton 
          variant="text" 
          lines={variant === 'featured' ? 2 : 2}
          className={variant === 'featured' ? 'h-6' : variant === 'compact' ? 'h-4' : 'h-5'}
        />

        {/* Excerpt Skeleton */}
        {variant !== 'compact' && (
          <div className="mt-3">
            <Skeleton variant="text" lines={3} className="h-4" />
          </div>
        )}

        {/* Author and Meta Skeleton */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <Skeleton variant="circular" width={32} height={32} />
            <div className="space-y-1">
              <Skeleton variant="text" width={80} className="h-3" />
              <Skeleton variant="text" width={60} className="h-3" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton variant="text" width={30} className="h-3" />
            <Skeleton variant="text" width={30} className="h-3" />
          </div>
        </div>

        {/* Tags for compact variant */}
        {variant === 'compact' && (
          <div className="flex gap-1 mt-3">
            <Skeleton variant="rectangular" width={40} height={16} className="rounded" />
            <Skeleton variant="rectangular" width={50} height={16} className="rounded" />
            <Skeleton variant="rectangular" width={35} height={16} className="rounded" />
          </div>
        )}
      </div>
    </div>
  );
};

// Comment Skeleton
export const CommentSkeleton: React.FC = () => {
  return (
    <div className="flex space-x-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton variant="text" width={80} className="h-3" />
            <Skeleton variant="text" width={60} className="h-3" />
          </div>
          <Skeleton variant="text" lines={2} className="h-3" />
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <Skeleton variant="text" width={40} className="h-3" />
          <Skeleton variant="text" width={30} className="h-3" />
        </div>
      </div>
    </div>
  );
};

// Profile Header Skeleton
export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <Skeleton variant="circular" width={120} height={120} />

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <Skeleton variant="text" width={200} className="h-8 mb-2" />
                <Skeleton variant="text" width={300} className="h-5 mb-3" />
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton variant="text" width={120} className="h-4" />
                  <Skeleton variant="text" width={100} className="h-4" />
                  <Skeleton variant="text" width={140} className="h-4" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Skeleton variant="rectangular" width={100} height={36} className="rounded-lg" />
                <Skeleton variant="rectangular" width={80} height={36} className="rounded-lg" />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 flex items-center space-x-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center">
                  <Skeleton variant="text" width={40} className="h-6 mb-1" />
                  <Skeleton variant="text" width={50} className="h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Post Detail Skeleton
export const PostDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <article className="bg-white">
        {/* Hero Image */}
        <Skeleton variant="rectangular" className="w-full h-96" />

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
          </div>

          {/* Title */}
          <Skeleton variant="text" lines={2} className="h-12 mb-6" />

          {/* Author and Meta */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div>
                <Skeleton variant="text" width={120} className="h-4 mb-1" />
                <Skeleton variant="text" width={100} className="h-3" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton variant="rectangular" width={32} height={32} className="rounded" />
              <Skeleton variant="rectangular" width={32} height={32} className="rounded" />
              <Skeleton variant="rectangular" width={32} height={32} className="rounded" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} variant="text" lines={4} className="h-4" />
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={60} height={24} className="rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Skeleton; 