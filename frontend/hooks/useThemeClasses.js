// hooks/useThemeClasses.js
import { themeClasses } from '../utils/themeClasses';

export const useThemeClasses = () => {
  // Simplified version without context dependency
  const theme = 'light'; // Default theme
  const classes = themeClasses;
  
  const combineClasses = (...classNames) => {
    return classNames.filter(Boolean).join(' ');
  };

  return {
    classes,
    combineClasses,
    theme
  };
};

export default useThemeClasses;
