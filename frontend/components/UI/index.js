// components/UI/index.js - Core UI components
// Core UI Components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Icon, ActionIcon, StatusIcon, AccentIcon, AvatarIcon } from './Icon';
export { default as Card } from './Card';
export { default as Avatar } from './Avatar';
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

// Advanced Animation Components
export { default as SpotlightBorder } from './SpotlightBorder';
export { 
  default as SpringMotion,
  springConfigs,
  animationVariants,
  SpringDiv,
  StaggerContainer,
  StaggerChild,
  MagneticButton,
  FloatingElement,
  PulseElement
} from './SpringMotion';

// Premium Interactions
export { 
  default as PremiumInteractions,
  MagneticButton as AdvancedMagneticButton,
  DirectionalButton,
  ShimmerCard,
  FloatingActionButton
} from './PremiumInteractions';

// Error Handling
export { 
  default as ErrorBoundary,
  useErrorBoundary,
  withErrorBoundary
} from './ErrorBoundary';

// Performance Optimization
export {
  default as PerformanceOptimizer,
  useAnimationPerformance,
  useOptimizedMotionValue,
  useDeviceCapabilities,
  useAdaptiveAnimationConfig,
  useOptimizedIntersectionObserver,
  useDebouncedAnimation,
  useAnimationLoop,
  withPerformanceOptimization
} from './PerformanceOptimizer';