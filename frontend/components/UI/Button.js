// components/UI/Button.js - Enhanced with accessibility
import React, { forwardRef } from 'react';
import { themeClasses, componentClasses, combineClasses } from '../../utils/themeClasses';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  loadingText = 'Đang tải...',
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
  ariaLabel,
  ariaDescribedBy,
  ...props 
}, ref) => {
  
  const buttonClasses = combineClasses(
    themeClasses.interactive.buttonBase,
    themeClasses.interactive.touchTarget,
    themeClasses.focus.visible,
    componentClasses.button[variant] || componentClasses.button.primary,
    componentClasses.button[`${variant}${size === 'sm' ? 'Small' : size === 'lg' ? 'Large' : ''}`] || componentClasses.button[variant] || componentClasses.button.primary,
    fullWidth ? themeClasses.utils.fullWidth : '',
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {loading && (
        <div className={combineClasses(themeClasses.loading.spinner, themeClasses.icons.sm, '-ml-1 mr-2')} aria-hidden="true" />
      )}
      {loading ? loadingText : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
