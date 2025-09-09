// components/UI/Icon.js - Standardized Icon Component
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

/**
 * Standardized Icon wrapper component for consistent sizing and styling
 * 
 * @param {React.Component} icon - The icon component (e.g., FaEye, FaComment)
 * @param {string} size - Icon size: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {string} variant - Icon color variant: 'primary', 'secondary', 'muted', 'accent', 'interactive'
 * @param {boolean} interactive - Whether icon has hover/click effects
 * @param {string} className - Additional CSS classes
 */
const Icon = ({ 
  icon: IconComponent, 
  size = 'sm', 
  variant = 'secondary',
  interactive = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const sizeClass = themeClasses.icons[size] || themeClasses.icons.sm;
  const variantClass = themeClasses.icons[variant] || themeClasses.icons.secondary;
  const interactiveClass = interactive ? themeClasses.icons.button : '';
  const loadingClass = loading ? 'animate-pulse' : '';

  const iconClasses = combineClasses(
    sizeClass,
    variantClass,
    interactiveClass,
    loadingClass,
    className
  );

  return (
    <IconComponent 
      className={iconClasses}
      {...props}
    />
  );
};

// Preset icon configurations for common use cases
export const ActionIcon = ({ icon, loading = false, ...props }) => (
  <Icon 
    icon={icon}
    size="sm"
    variant="interactive"
    interactive
    loading={loading}
    {...props}
  />
);

export const StatusIcon = ({ icon, ...props }) => (
  <Icon 
    icon={icon}
    size="sm"
    variant="muted"
    {...props}
  />
);

export const AccentIcon = ({ icon, ...props }) => (
  <Icon 
    icon={icon}
    size="sm"
    variant="accent"
    {...props}
  />
);

export const AvatarIcon = ({ icon, ...props }) => (
  <Icon 
    icon={icon}
    size="lg"
    variant="accent"
    {...props}
  />
);

export default Icon;
