// components/UI/Card.js - Medium 2024 Design
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props 
}) => {
  const variants = {
    default: combineClasses(themeClasses.interactive.cardBase, themeClasses.effects.rounded),
    elevated: combineClasses(themeClasses.interactive.cardBase, themeClasses.effects.rounded, themeClasses.effects.shadowLarge),
    flat: themeClasses.effects.rounded,
    outline: combineClasses(themeClasses.effects.rounded, themeClasses.border.primary, 'border shadow-none'),
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: themeClasses.spacing.card,
    lg: 'p-8',
    xl: 'p-12',
  };

  const hoverClasses = hover ? themeClasses.interactions.cardHover : '';

  const cardClasses = combineClasses(
    themeClasses.animations.smooth,
    variants[variant],
    paddings[padding],
    hoverClasses,
    className
  );

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
    <div className={combineClasses(
      'mt-6 pt-4 border-t',
      themeClasses.border.primary,
      className
    )} {...props}>
      {children}
    </div>
  );
};

export default Card;
