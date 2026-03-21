// components/UI/Skeleton.js - Advanced skeleton loading states
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const Skeleton = ({ 
  variant = 'text',
  width = 'full',
  height = 'auto',
  className = '',
  rounded = 'md',
  animation = true,
  ...props 
}) => {
  const variants = {
    text: 'h-4',
    title: 'h-6',
    heading: 'h-8',
    paragraph: 'h-4',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-32',
    button: 'h-10',
    input: 'h-10',
    image: 'aspect-video',
  };

  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
    '1/3': 'w-1/3',
    '2/3': 'w-2/3',
    auto: 'w-auto',
  };

  const heights = {
    auto: '',
    xs: 'h-2',
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
    '2xl': 'h-12',
    '3xl': 'h-16',
  };

  const roundedOptions = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const baseClasses = combineClasses(
    '',
    animation ? themeClasses.animations.skeleton : '',
    variants[variant] || variants.text,
    widths[width] || widths.full,
    heights[height] || '',
    roundedOptions[rounded] || roundedOptions.md,
    className
  );

  return <div className={baseClasses} {...props} />;
};

// Specialized skeleton components
export const SkeletonText = ({ lines = 1, className = '', ...props }) => (
  <div className={combineClasses('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? '3/4' : 'full'}
        {...props}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '', showImage = true, showMeta = true, ...props }) => (
  <div className={combineClasses('animate-fade-in', className)} {...props}>
    <div className="p-4  rounded-lg border border-medium-border space-y-4">
      {showImage && (
        <Skeleton variant="image" className="w-full" />
      )}
      <div className="space-y-md">
        <Skeleton variant="heading" width="3/4" />
        <SkeletonText lines={3} />
        {showMeta && (
          <div className="flex items-center gap-4 pt-4">
            <Skeleton variant="avatar" />
            <div className="space-y-sm flex-1">
              <Skeleton variant="text" width="1/3" />
              <Skeleton variant="text" width="1/4" />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const SkeletonPost = ({ className = '', ...props }) => (
  <div className={combineClasses('animate-slide-up', className)} {...props}>
    <div className="p-card bg-medium-bg-card pb-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          <Skeleton variant="heading" width="2/3" />
          <SkeletonText lines={3} />
          
          {/* Meta information */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
            <div className="flex items-center gap-4">
              <Skeleton variant="text" width="20" />
              <div className="w-1 h-1 bg-medium-text-muted rounded-full"></div>
              <Skeleton variant="text" width="16" />
            </div>
            <div className="flex items-center gap-6">
              <Skeleton variant="button" width="16" height="sm" />
              <Skeleton variant="button" width="16" height="sm" />
              <Skeleton variant="button" width="16" height="sm" />
            </div>
          </div>
        </div>
        
        {/* Thumbnail */}
        <div className="w-full lg:w-48 lg:flex-shrink-0">
          <Skeleton variant="image" className="w-full h-32 lg:h-24" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonComment = ({ className = '', showReplies = false, ...props }) => (
  <div className={combineClasses('animate-fade-in', className)} {...props}>
    <div className="p-card  rounded-card border border-medium-border">
      <div className="flex gap-md">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-md">
          <div className="flex items-center gap-sm">
            <Skeleton variant="text" width="24" />
            <Skeleton variant="text" width="16" />
          </div>
          <SkeletonText lines={2} />
          <div className="flex items-center gap-4">
            <Skeleton variant="button" width="12" height="sm" />
            <Skeleton variant="button" width="12" height="sm" />
          </div>
        </div>
      </div>
      
      {showReplies && (
        <div className="mt-4 ml-14 space-y-3">
          <SkeletonComment />
        </div>
      )}
    </div>
  </div>
);

export const SkeletonProfile = ({ className = '', ...props }) => (
  <div className={combineClasses('animate-scale-in', className)} {...props}>
    <div className="text-center space-y-6">
      {/* Avatar */}
      <div className="flex justify-center">
        <Skeleton variant="avatar" className="w-24 h-24" />
      </div>
      
      {/* Profile info */}
      <div className="space-y-md">
        <Skeleton variant="title" width="1/3" className="mx-auto" />
        <Skeleton variant="text" width="1/2" className="mx-auto" />
        <SkeletonText lines={2} className="max-w-md mx-auto" />
      </div>
      
      {/* Stats */}
      <div className="flex justify-center gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center space-y-sm">
            <Skeleton variant="text" width="12" />
            <Skeleton variant="text" width="16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ 
  count = 3, 
  component: Component = SkeletonPost,
  className = '',
  stagger = true,
  ...props 
}) => (
  <div className={combineClasses('space-y-gap', className)}>
    {Array.from({ length: count }).map((_, index) => (
      <Component
        key={index}
        style={stagger ? { animationDelay: `${index * 100}ms` } : {}}
        {...props}
      />
    ))}
  </div>
);

export default Skeleton;
