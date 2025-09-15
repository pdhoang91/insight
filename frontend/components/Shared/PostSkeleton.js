// components/Shared/PostSkeleton.js
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

// Reusable skeleton components
const SkeletonBox = ({ className, width, height }) => (
  <div className={combineClasses(
    themeClasses.patterns.skeleton,
    themeClasses.effects.rounded,
    className,
    width,
    height
  )} />
);

const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={combineClasses(
      sizes[size],
      themeClasses.patterns.skeleton,
      'rounded-full'
    )} />
  );
};

const PostSkeleton = ({ variant = 'card' }) => {
  const containerClasses = combineClasses(
    themeClasses.bg.card,
    'border-b',
    themeClasses.border.primary,
    'pb-8 mb-8 overflow-hidden animate-pulse'
  );

  if (variant === 'enhanced') {
    return (
      <div className={containerClasses}>
        {/* Image skeleton */}
        <SkeletonBox className="h-56" />
        <div className={themeClasses.spacing.card}>
          {/* Author info skeleton */}
          <div className={combineClasses(
            'flex items-center mb-4',
            themeClasses.spacing.gapSmall
          )}>
            <SkeletonAvatar />
            <div className="flex-1">
              <SkeletonBox width="w-24" height="h-4" className="mb-1" />
              <SkeletonBox width="w-16" height="h-3" />
            </div>
            <SkeletonBox width="w-12" height="h-3" />
          </div>
          
          {/* Title skeleton */}
          <SkeletonBox width="w-3/4" height="h-6" className="mb-3" />
          
          {/* Content skeleton */}
          <div className={combineClasses(themeClasses.spacing.stackTiny, 'mb-4')}>
            <SkeletonBox height="h-4" />
            <SkeletonBox width="w-5/6" height="h-4" />
            <SkeletonBox width="w-4/6" height="h-4" />
          </div>
          
          {/* Tags skeleton */}
          <div className={combineClasses('flex mb-4', themeClasses.spacing.gapTiny)}>
            <SkeletonBox width="w-16" height="h-6" className="rounded-full" />
            <SkeletonBox width="w-20" height="h-6" className="rounded-full" />
            <SkeletonBox width="w-14" height="h-6" className="rounded-full" />
          </div>
          
          {/* Actions skeleton */}
          <div className="flex items-center justify-between pt-4">
            <div className={combineClasses('flex items-center', themeClasses.spacing.gapLarge)}>
              <SkeletonBox width="w-12" height="h-4" />
              <SkeletonBox width="w-12" height="h-4" />
              <SkeletonBox width="w-8" height="h-4" />
            </div>
            <div className={combineClasses('flex items-center', themeClasses.spacing.gapSmall)}>
              <SkeletonBox width="w-8" height="h-8" />
              <SkeletonBox width="w-8" height="h-8" />
              <SkeletonBox width="w-12" height="h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={combineClasses(
        containerClasses,
        themeClasses.effects.rounded
      )}>
        <div className="flex">
          <SkeletonBox className="w-20 h-20" />
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between mb-2">
              <SkeletonBox width="w-24" height="h-3" />
              <SkeletonBox width="w-16" height="h-3" />
            </div>
            <SkeletonBox height="h-4" className="mb-1" />
            <SkeletonBox width="w-3/4" height="h-4" className="mb-2" />
            <SkeletonBox height="h-3" className="mb-2" />
            <div className={combineClasses('flex mb-2', themeClasses.spacing.gapTiny)}>
              <SkeletonBox width="w-12" height="h-4" />
              <SkeletonBox width="w-16" height="h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
                <SkeletonBox width="w-8" height="h-3" />
                <SkeletonBox width="w-8" height="h-3" />
              </div>
              <SkeletonBox width="w-16" height="h-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={combineClasses(
        containerClasses,
        themeClasses.effects.rounded,
        themeClasses.spacing.card
      )}>
        <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
          <div className="flex-1">
            <SkeletonBox width="w-3/4" height="h-4" className="mb-3" />
            <SkeletonBox width="w-1/2" height="h-4" className="mb-4" />
            <div className={themeClasses.spacing.stackTiny}>
              <SkeletonBox height="h-3" />
              <SkeletonBox width="w-5/6" height="h-3" />
              <SkeletonBox width="w-4/6" height="h-3" />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className={combineClasses('flex items-center', themeClasses.spacing.gapTiny)}>
                <SkeletonAvatar size="sm" />
                <SkeletonBox width="w-20" height="h-3" />
              </div>
              <SkeletonBox width="w-16" height="h-3" />
            </div>
          </div>
          <SkeletonBox className="w-32 h-24" />
        </div>
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={combineClasses(
        containerClasses,
        themeClasses.effects.rounded,
        themeClasses.spacing.card
      )}>
        <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
          <div className="flex-shrink-0">
            <SkeletonAvatar size="lg" />
          </div>
          <div className="flex-1">
            <SkeletonBox width="w-1/4" height="h-4" className="mb-2" />
            <SkeletonBox width="w-3/4" height="h-5" className="mb-3" />
            <div className={combineClasses(themeClasses.spacing.stackTiny, 'mb-4')}>
              <SkeletonBox height="h-3" />
              <SkeletonBox width="w-5/6" height="h-3" />
              <SkeletonBox width="w-4/6" height="h-3" />
            </div>
            <div className="flex items-center justify-between">
              <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
                <SkeletonBox width="w-12" height="h-3" />
                <SkeletonBox width="w-12" height="h-3" />
                <SkeletonBox width="w-8" height="h-3" />
              </div>
              <SkeletonBox width="w-16" height="h-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={combineClasses(
      containerClasses,
      themeClasses.effects.rounded
    )}>
      <SkeletonBox className="h-48" />
      <div className={themeClasses.spacing.card}>
        <SkeletonBox width="w-3/4" height="h-4" className="mb-3" />
        <SkeletonBox width="w-1/2" height="h-4" className="mb-4" />
        <div className={themeClasses.spacing.stackTiny}>
          <SkeletonBox height="h-3" />
          <SkeletonBox width="w-5/6" height="h-3" />
          <SkeletonBox width="w-4/6" height="h-3" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className={combineClasses('flex items-center', themeClasses.spacing.gapTiny)}>
            <SkeletonAvatar size="sm" />
            <SkeletonBox width="w-20" height="h-3" />
          </div>
          <SkeletonBox width="w-16" height="h-3" />
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton; 