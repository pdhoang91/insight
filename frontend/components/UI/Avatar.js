// components/UI/Avatar.js - Medium 2024 Design
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

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
    xs: combineClasses(themeClasses.avatar.xs, themeClasses.text.xs),
    sm: combineClasses(themeClasses.avatar.sm, themeClasses.text.sm),
    md: combineClasses(themeClasses.avatar.md, themeClasses.text.base),
    lg: combineClasses(themeClasses.avatar.lg, themeClasses.text.lg),
    xl: combineClasses(themeClasses.avatar.xl, themeClasses.text.xl),
    '2xl': combineClasses(themeClasses.avatar.xxl, themeClasses.text.xxl),
  };

  const variants = {
    circle: 'rounded-full',
    square: themeClasses.effects.rounded,
  };

  const avatarClasses = combineClasses(
    'inline-flex items-center justify-center font-medium',
    themeClasses.bg.elevated,
    themeClasses.text.primary,
    themeClasses.utils.overflowHidden,
    sizes[size],
    variants[variant],
    className
  );

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
