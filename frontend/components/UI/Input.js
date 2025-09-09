// components/UI/Input.js - Medium 2024 Design
import React from 'react';

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  label,
  helperText,
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-ui bg-medium-bg-secondary border border-medium-border text-medium-text-primary placeholder-medium-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medium-accent-green focus:border-medium-accent-green disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-md py-sm text-body-small rounded-lg',
    md: 'px-lg py-md text-body rounded-lg',
    lg: 'px-xl py-lg text-body-large rounded-lg',
  };
  
  const errorClasses = error ? 'border-error focus:border-error focus:ring-error' : '';
  
  const inputClasses = [
    baseClasses,
    sizes[size],
    errorClasses,
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-label font-medium text-medium-text-primary mb-sm">
          {label}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {(helperText || error) && (
        <p className={`mt-sm text-body-small ${error ? 'text-error' : 'text-medium-text-muted'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
