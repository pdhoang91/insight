// components/UI/ContentArea.js
import React from 'react';
import PropTypes from 'prop-types';

const ContentArea = ({ 
  variant = 'standard', 
  className = '', 
  children,
  ...props 
}) => {
  const variants = {
    standard: 'standard-page-content',
    wide: 'wide-page-content',
    profile: 'profile-content',
  };

  const baseClass = variants[variant] || variants.standard;

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

ContentArea.propTypes = {
  variant: PropTypes.oneOf(['standard', 'wide', 'profile']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default ContentArea; 