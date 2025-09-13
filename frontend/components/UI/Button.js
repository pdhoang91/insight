// components/UI/Button.js - Enhanced with accessibility
import React, { forwardRef } from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

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
  // Enhanced accessibility and interaction classes with spring physics
  const baseClasses = combineClasses(
    'inline-flex items-center justify-center font-ui font-medium',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-medium-accent-green focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
    'min-h-[44px] touch:min-w-[44px]', // Touch-friendly sizing
    'select-none' // Prevent text selection
  );

  const variants = {
    primary: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 active:bg-medium-accent-green/80 shadow-sm hover:shadow-[0_8px_25px_rgba(26,137,23,0.25)] hover:-translate-y-0.5 hover:scale-[1.02]',
    primaryMagnetic: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 active:bg-medium-accent-green/80 shadow-sm hover:shadow-[0_10px_30px_rgba(26,137,23,0.3)] hover:-translate-y-1 hover:scale-105',
    secondary: ' text-medium-text-primary border border-medium-border hover:bg-medium-hover active:bg-medium-active hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5',
    ghost: 'text-medium-text-secondary hover:text-medium-text-primary hover:bg-medium-hover active:bg-medium-active hover:scale-[1.02]',
    outline: 'border border-medium-border text-medium-text-primary hover:bg-medium-hover active:bg-medium-active hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5',
    danger: 'bg-error text-white hover:bg-error-dark active:bg-error-dark shadow-sm hover:shadow-[0_8px_25px_rgba(239,68,68,0.25)] hover:-translate-y-0.5 hover:scale-[1.02]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-body-small rounded-button',
    md: 'px-4 py-2 text-button rounded-button',
    lg: 'px-6 py-3 text-body-large rounded-button',
    xl: 'px-8 py-4 text-heading-3 rounded-button',
  };

  const buttonClasses = [
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
