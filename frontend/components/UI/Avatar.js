// components/UI/Avatar.js - Medium 2024 Design
import React from 'react';

const Avatar = ({ 
  src,
  alt,
  name,
  size = 'md',
  variant = 'circle',
  className = '',
  ...props 
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const variants = {
    circle: 'rounded-full',
    square: 'rounded-medium',
  };

  const baseClasses = 'inline-flex items-center justify-center bg-medium-bg-elevated text-medium-text-primary font-medium overflow-hidden';

  const avatarClasses = [
    baseClasses,
    sizes[size],
    variants[variant],
    className
  ].filter(Boolean).join(' ');

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={avatarClasses}
        {...props}
      />
    );
  }

  return (
    <div className={avatarClasses} {...props}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
