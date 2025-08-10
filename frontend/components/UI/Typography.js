// components/UI/Typography.js
import React from 'react';
import PropTypes from 'prop-types';

export const PageTitle = ({ className = '', children, ...props }) => (
  <h1 className={`page-title ${className}`} {...props}>
    {children}
  </h1>
);

export const PageSubtitle = ({ className = '', children, ...props }) => (
  <p className={`page-subtitle ${className}`} {...props}>
    {children}
  </p>
);

export const StandardPageTitle = ({ className = '', children, ...props }) => (
  <h1 className={`standard-page-title ${className}`} {...props}>
    {children}
  </h1>
);

export const StandardPageSubtitle = ({ className = '', children, ...props }) => (
  <p className={`standard-page-subtitle ${className}`} {...props}>
    {children}
  </p>
);

export const PostTitle = ({ className = '', children, ...props }) => (
  <h2 className={`post-title ${className}`} {...props}>
    {children}
  </h2>
);

export const PostMeta = ({ className = '', children, ...props }) => (
  <div className={`post-meta ${className}`} {...props}>
    {children}
  </div>
);

export const TechComment = ({ className = '', children, ...props }) => (
  <span className={`tech-comment ${className}`} {...props}>
    {children}
  </span>
);

// Text variants
export const Text = ({ 
  variant = 'primary', 
  size = 'base',
  className = '', 
  children, 
  as: Component = 'span',
  ...props 
}) => {
  const variants = {
    primary: 'text-primary',
    secondary: 'text-secondary', 
    muted: 'text-muted',
    content: 'text-content',
    'content-secondary': 'text-content-secondary',
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.base;

  return (
    <Component className={`${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </Component>
  );
};

Text.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'muted', 'content', 'content-secondary']),
  size: PropTypes.oneOf(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  as: PropTypes.elementType,
}; 