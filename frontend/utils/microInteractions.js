// utils/microInteractions.js
// Enhanced micro-interactions and animations for better UX

export const microInteractions = {
  // Button interactions
  buttonPress: {
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  
  buttonHover: {
    scale: 1.02,
    y: -1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Card interactions
  cardHover: {
    y: -2,
    scale: 1.005,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  cardPress: {
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  
  // Modal animations
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Staggered animations for lists
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // Loading animations
  loadingSpinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  },
  
  loadingPulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  
  // Toast notifications
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -50, scale: 0.95 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Icon animations
  iconHover: {
    scale: 1.1,
    rotate: 5,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  iconPress: {
    scale: 0.9,
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  
  // Form field animations
  fieldFocus: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  fieldError: {
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  // Success animations
  success: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  
  // Navigation animations
  navItemHover: {
    y: -1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Dropdown animations
  dropdown: {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Image loading animations
  imageLoad: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Skeleton loading
  skeleton: {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Helper functions for common animation patterns
export const createStaggeredAnimation = (children, delay = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay
    }
  }
});

export const createSlideAnimation = (direction = 'up', distance = 20) => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance }
  };

  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directions[direction] },
    transition: { duration: 0.3, ease: 'easeOut' }
  };
};

export const createScaleAnimation = (scale = 0.95) => ({
  initial: { opacity: 0, scale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale },
  transition: { duration: 0.2, ease: 'easeOut' }
});

// Responsive animation utilities
export const getReducedMotionPreference = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

export const adaptAnimationForMotionPreference = (animation) => {
  if (getReducedMotionPreference()) {
    return {
      ...animation,
      transition: { duration: 0.01 }
    };
  }
  return animation;
};

export default microInteractions;
