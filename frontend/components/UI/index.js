// components/UI/index.js - Core UI components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
export { default as Avatar } from './Avatar';
export { default as ThemeToggle } from './ThemeToggle';

// Loading components
export { 
  Spinner,
  Skeleton,
  CardSkeleton,
  PostSkeleton,
  LoadingScreen,
  InlineLoading,
  ButtonLoading
} from './Loading';

// Legacy aliases for backward compatibility
export { Spinner as LoadingSpinner } from './Loading';