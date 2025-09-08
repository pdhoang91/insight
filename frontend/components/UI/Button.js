// components/UI/Button.js - Medium 2024 Design
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-ui font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-medium-accent-green focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90 active:bg-medium-accent-green/80 shadow-sm hover:shadow-md',
    secondary: 'bg-medium-bg-secondary text-medium-text-primary border border-medium-border hover:bg-medium-hover active:bg-medium-active',
    ghost: 'text-medium-text-secondary hover:text-medium-text-primary hover:bg-medium-hover active:bg-medium-active',
    outline: 'border border-medium-border text-medium-text-primary hover:bg-medium-hover active:bg-medium-active',
    danger: 'bg-error text-white hover:bg-error-dark active:bg-error-dark shadow-sm hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-button',
    md: 'px-4 py-2 text-button rounded-button',
    lg: 'px-6 py-3 text-lg rounded-button',
    xl: 'px-8 py-4 text-xl rounded-button',
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
};

export default Button;
