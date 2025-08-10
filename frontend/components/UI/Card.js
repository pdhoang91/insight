// components/UI/Card.js
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  variant = 'surface', 
  className = '', 
  children,
  hover = false,
  ...props 
}) => {
  const variants = {
    surface: 'card',
    content: 'card-content',
    post: 'post-item',
  };

  const baseClass = variants[variant] || variants.surface;
  const hoverClass = hover ? 'hover:shadow-md transition-all' : '';

  return (
    <div className={`${baseClass} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  variant: PropTypes.oneOf(['surface', 'content', 'post']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool,
};

export default Card; 