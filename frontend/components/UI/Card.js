// components/UI/Card.js - Medium 2024 Design
import React from 'react';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-medium-bg-card transition-all duration-200';

  const variants = {
    default: 'rounded-card shadow-card',
    elevated: 'rounded-card shadow-elevated',
    flat: 'rounded-medium',
    outline: 'rounded-card border border-medium-border shadow-none',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const hoverClasses = hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : '';

  const cardClasses = [
    baseClasses,
    variants[variant],
    paddings[padding],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card Header component
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Body component
export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Footer component
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`mt-6 pt-4 border-t border-medium-divider ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
