// components/Mobile/TouchGestures.js - Medium 2024 Mobile Interactions
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';

// Touch Gesture Hook for swipe actions
export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

// Swipeable Card Component
export const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = '',
  leftAction = null,
  rightAction = null
}) => {
  const controls = useAnimation();
  const [dragDirection, setDragDirection] = useState(null);

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
      if (offset.x > 0) {
        // Swiped right
        controls.start({ x: 300, opacity: 0 });
        setTimeout(() => onSwipeRight?.(), 200);
      } else {
        // Swiped left
        controls.start({ x: -300, opacity: 0 });
        setTimeout(() => onSwipeLeft?.(), 200);
      }
    } else {
      // Snap back
      controls.start({ x: 0, opacity: 1 });
    }
    
    setDragDirection(null);
  };

  const handleDrag = (event, info) => {
    const { offset } = info;
    if (offset.x > 50) {
      setDragDirection('right');
    } else if (offset.x < -50) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Action Indicators */}
      {leftAction && (
        <div className={`absolute left-0 top-0 bottom-0 flex items-center justify-start pl-6 transition-opacity ${
          dragDirection === 'right' ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-medium-accent-green text-white p-3 rounded-full">
            {leftAction}
          </div>
        </div>
      )}
      
      {rightAction && (
        <div className={`absolute right-0 top-0 bottom-0 flex items-center justify-end pr-6 transition-opacity ${
          dragDirection === 'left' ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-error text-white p-3 rounded-full">
            {rightAction}
          </div>
        </div>
      )}

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 "
      >
        {children}
      </motion.div>
    </div>
  );
};

// Pull to Refresh Component
export const PullToRefresh = ({ 
  children, 
  onRefresh, 
  threshold = 80,
  className = '' 
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 1.5));
        setCanRefresh(distance > threshold);
      }
    };

    const handleTouchEnd = async () => {
      if (isDragging && canRefresh && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh?.();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      isDragging = false;
      setPullDistance(0);
      setCanRefresh(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [onRefresh, threshold, canRefresh, isRefreshing]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Pull Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{ 
          height: pullDistance,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`
        }}
      >
        <div className={`text-medium-text-muted transition-all ${
          canRefresh ? 'text-medium-accent-green' : ''
        }`}>
          {isRefreshing ? (
            <div className="animate-spin w-6 h-6 border-2 border-medium-accent-green border-t-transparent rounded-full" />
          ) : canRefresh ? (
            <span className="text-sm font-medium">Release to refresh</span>
          ) : (
            <span className="text-sm">Pull to refresh</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        style={{ transform: `translateY(${pullDistance}px)` }}
        className="transition-transform duration-200"
      >
        {children}
      </div>
    </div>
  );
};

// Long Press Hook
export const useLongPress = (onLongPress, delay = 500) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef();
  const target = useRef();

  const start = (event) => {
    if (event.target !== target.current) {
      target.current = event.target;
    }
    
    timeout.current = setTimeout(() => {
      onLongPress(event);
      setLongPressTriggered(true);
    }, delay);
  };

  const clear = (event, shouldTriggerClick = true) => {
    timeout.current && clearTimeout(timeout.current);
    shouldTriggerClick && longPressTriggered && event.preventDefault();
    setLongPressTriggered(false);
  };

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear
  };
};

// Haptic Feedback Hook
export const useHapticFeedback = () => {
  const triggerHaptic = (type = 'impact') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([10, 10, 10]);
          break;
        case 'error':
          navigator.vibrate([20, 10, 20]);
          break;
        default:
          navigator.vibrate(15);
      }
    }
  };

  return { triggerHaptic };
};

// Mobile Gesture Provider
export const MobileGestureProvider = ({ children }) => {
  const { triggerHaptic } = useHapticFeedback();

  useEffect(() => {
    // Disable default touch behaviors that interfere with custom gestures
    const preventDefaultTouch = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Add global touch event listeners
    document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefaultTouch);
      document.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, []);

  return (
    <div className="mobile-gesture-provider">
      {children}
    </div>
  );
};

// Floating Action Button with gesture support
export const FloatingActionButton = ({ 
  icon, 
  onClick, 
  className = '',
  position = 'bottom-right',
  hapticType = 'light'
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const longPressProps = useLongPress(() => {
    triggerHaptic('medium');
    // Could trigger additional long press action
  });

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const handleClick = (e) => {
    triggerHaptic(hapticType);
    onClick?.(e);
  };

  return (
    <motion.button
      {...longPressProps}
      onClick={handleClick}
      className={`
        ${positionClasses[position]}
        w-14 h-14 bg-medium-accent-green text-white rounded-full shadow-floating
        flex items-center justify-center z-50 hover:bg-medium-accent-green/90
        active:scale-95 transition-all duration-200
        ${className}
      `}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      {icon}
    </motion.button>
  );
};

export default {
  useSwipeGesture,
  SwipeableCard,
  PullToRefresh,
  useLongPress,
  useHapticFeedback,
  MobileGestureProvider,
  FloatingActionButton
};
