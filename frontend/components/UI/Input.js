// components/UI/Input.js - Medium 2024 Design
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
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: combineClasses(themeClasses.interactive.inputSmall, themeClasses.effects.rounded),
    md: combineClasses(themeClasses.interactive.inputMedium, themeClasses.effects.rounded),
    lg: combineClasses(themeClasses.interactive.inputLarge, themeClasses.effects.rounded),
  };
  
  const errorClasses = error ? 'border-error focus:border-error focus:ring-error' : '';
  
  const inputClasses = combineClasses(
    themeClasses.interactive.inputBase,
    themeClasses.interactive.input,
    sizes[size],
    errorClasses,
    fullWidth ? 'w-full' : '',
    className
  );

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className={combineClasses(
          'block mb-2',
          themeClasses.typography.labelMedium,
          themeClasses.text.primary
        )}>
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
        <p className={combineClasses(
          'mt-2',
          themeClasses.typography.bodyTiny,
          error ? themeClasses.text.error : themeClasses.text.muted
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
