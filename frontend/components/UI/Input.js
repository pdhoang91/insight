// components/UI/Input.js - Fully theme-based design
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

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
  required = false,
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: combineClasses(themeClasses.interactive.inputSmall, themeClasses.effects.rounded),
    md: combineClasses(themeClasses.interactive.inputMedium, themeClasses.effects.rounded),
    lg: combineClasses(themeClasses.interactive.inputLarge, themeClasses.effects.rounded),
  };
  
  const inputClasses = combineClasses(
    themeClasses.interactive.inputBase,
    themeClasses.interactive.input,
    sizes[size],
    error ? themeClasses.error.focus : themeClasses.focus.ring,
    fullWidth ? themeClasses.utils.fullWidth : '',
    className
  );

  return (
    <div className={fullWidth ? themeClasses.utils.fullWidth : ''}>
      {label && (
        <label className={required ? themeClasses.form.labelRequired : themeClasses.form.label}>
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
        required={required}
        {...props}
      />
      {error && typeof error === 'string' && (
        <p className={themeClasses.form.errorText}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className={themeClasses.form.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
