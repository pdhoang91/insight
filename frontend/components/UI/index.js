// components/UI/index.js - Core UI components
// Core UI Components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Icon, ActionIcon, StatusIcon, AccentIcon, AvatarIcon } from './Icon';
export { default as Card } from './Card';
export { default as Avatar } from './Avatar';
export { default as ThemeToggle } from './ThemeToggle';

// Loading States
export { 
  default as Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonPost, 
  SkeletonComment, 
  SkeletonProfile, 
  SkeletonList 
} from './Skeleton';

// Loading components (if they exist)
export { 
  Spinner,
  LoadingScreen,
  InlineLoading,
  ButtonLoading
} from './Loading';

// Legacy aliases for backward compatibility
export { Spinner as LoadingSpinner } from './Loading';