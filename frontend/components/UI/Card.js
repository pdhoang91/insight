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
  const baseClasses = 'transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)';

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

  const hoverClasses = hover ? 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)' : '';

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
