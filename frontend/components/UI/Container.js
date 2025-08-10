// components/UI/Container.js
import React from 'react';
import PropTypes from 'prop-types';

const Container = ({ 
  variant = 'standard', 
  className = '', 
  children,
  ...props 
}) => {
  const variants = {
    standard: 'standard-page',
    wide: 'standard-page', // Use same base
    profile: 'profile-page',
    loading: 'loading-container',
  };

  const baseClass = variants[variant] || variants.standard;

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

Container.propTypes = {
  variant: PropTypes.oneOf(['standard', 'wide', 'profile', 'loading']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Container; 