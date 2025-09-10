// components/Shared/PostSkeleton.js
import React from 'react';

const PostSkeleton = ({ variant = 'card' }) => {
  if (variant === 'enhanced') {
    return (
      <div className="rounded-2xl shadow-sm overflow-hidden animate-pulse">
        {/* Image skeleton */}
        <div className="h-56 "></div>
        <div className="p-6">
          {/* Author info skeleton */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10  rounded-full"></div>
            <div className="flex-1">
              <div className="h-4  rounded w-24 mb-1"></div>
              <div className="h-3  rounded w-16"></div>
            </div>
            <div className="h-3  rounded w-12"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="h-6  rounded w-3/4 mb-3"></div>
          
          {/* Content skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4  rounded"></div>
            <div className="h-4  rounded w-5/6"></div>
            <div className="h-4  rounded w-4/6"></div>
          </div>
          
          {/* Tags skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-6  rounded-full w-16"></div>
            <div className="h-6  rounded-full w-20"></div>
            <div className="h-6  rounded-full w-14"></div>
          </div>
          
          {/* Actions skeleton */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-6">
              <div className="h-4  rounded w-12"></div>
              <div className="h-4  rounded w-12"></div>
              <div className="h-4  rounded w-8"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8  rounded-lg"></div>
              <div className="h-8 w-8  rounded-lg"></div>
              <div className="h-4  rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="rounded-lg overflow-hidden animate-pulse shadow-sm">
        <div className="flex">
          <div className="w-20 h-20 "></div>
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3  rounded w-24"></div>
              <div className="h-3  rounded w-16"></div>
            </div>
            <div className="h-4  rounded w-full mb-1"></div>
            <div className="h-4  rounded w-3/4 mb-2"></div>
            <div className="h-3  rounded w-full mb-2"></div>
            <div className="flex gap-1 mb-2">
              <div className="h-4  rounded w-12"></div>
              <div className="h-4  rounded w-16"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <div className="h-3  rounded w-8"></div>
                <div className="h-3  rounded w-8"></div>
              </div>
              <div className="h-3  rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="rounded-lg shadow-sm  overflow-hidden animate-pulse p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="h-4  rounded w-3/4 mb-3"></div>
            <div className="h-4  rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3  rounded"></div>
              <div className="h-3  rounded w-5/6"></div>
              <div className="h-3  rounded w-4/6"></div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6  rounded-full"></div>
                <div className="h-3  rounded w-20"></div>
              </div>
              <div className="h-3  rounded w-16"></div>
            </div>
          </div>
          <div className="w-32 h-24  rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className="rounded-lg shadow-sm  overflow-hidden animate-pulse p-6">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12  rounded-full"></div>
          </div>
          <div className="flex-1">
            <div className="h-4  rounded w-1/4 mb-2"></div>
            <div className="h-5  rounded w-3/4 mb-3"></div>
            <div className="space-y-2 mb-4">
              <div className="h-3  rounded"></div>
              <div className="h-3  rounded w-5/6"></div>
              <div className="h-3  rounded w-4/6"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="h-3  rounded w-12"></div>
                <div className="h-3  rounded w-12"></div>
                <div className="h-3  rounded w-8"></div>
              </div>
              <div className="h-3  rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 "></div>
      <div className="p-6">
        <div className="h-4  rounded w-3/4 mb-3"></div>
        <div className="h-4  rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3  rounded"></div>
          <div className="h-3  rounded w-5/6"></div>
          <div className="h-3  rounded w-4/6"></div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6  rounded-full"></div>
            <div className="h-3  rounded w-20"></div>
          </div>
          <div className="h-3  rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton; 