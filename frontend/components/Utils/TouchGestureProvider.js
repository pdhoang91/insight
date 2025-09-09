// components/Utils/TouchGestureProvider.js - Advanced touch gesture system
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const TouchGestureContext = createContext();

export const useTouchGesture = () => {
  const context = useContext(TouchGestureContext);
  if (!context) {
    throw new Error('useTouchGesture must be used within TouchGestureProvider');
  }
  return context;
};

export const TouchGestureProvider = ({ children }) => {
  const [isTouch, setIsTouch] = useState(false);
  const [gestureState, setGestureState] = useState({
    isGesturing: false,
    startPoint: null,
    currentPoint: null,
    direction: null,
    distance: 0,
    velocity: 0,
  });

  // Detect touch capability
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const createGestureHandler = (callbacks = {}) => {
    const {
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onTap,
      onLongPress,
      onPinch,
      threshold = 50,
      longPressDelay = 500,
    } = callbacks;

    let startTime = 0;
    let startTouch = null;
    let longPressTimer = null;
    let initialDistance = 0;

    const handleTouchStart = (e) => {
      startTime = Date.now();
      
      if (e.touches.length === 1) {
        startTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        
        setGestureState(prev => ({
          ...prev,
          isGesturing: true,
          startPoint: startTouch,
          currentPoint: startTouch,
        }));

        // Long press detection
        if (onLongPress) {
          longPressTimer = setTimeout(() => {
            onLongPress(e);
          }, longPressDelay);
        }
      } else if (e.touches.length === 2 && onPinch) {
        // Pinch gesture
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
    };

    const handleTouchMove = (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (e.touches.length === 1 && startTouch) {
        const currentTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };

        const deltaX = currentTouch.x - startTouch.x;
        const deltaY = currentTouch.y - startTouch.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        let direction = null;
        if (distance > threshold) {
          if (angle >= -45 && angle <= 45) direction = 'right';
          else if (angle >= 45 && angle <= 135) direction = 'down';
          else if (angle >= 135 || angle <= -135) direction = 'left';
          else if (angle >= -135 && angle <= -45) direction = 'up';
        }

        setGestureState(prev => ({
          ...prev,
          currentPoint: currentTouch,
          direction,
          distance,
          velocity: distance / (Date.now() - startTime),
        }));
      } else if (e.touches.length === 2 && onPinch && initialDistance > 0) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const scale = currentDistance / initialDistance;
        onPinch({ scale, delta: currentDistance - initialDistance });
      }
    };

    const handleTouchEnd = (e) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (startTouch && e.changedTouches.length === 1) {
        const endTouch = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
        };

        const deltaX = endTouch.x - startTouch.x;
        const deltaY = endTouch.y - startTouch.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Tap detection
        if (distance < threshold && duration < 300 && onTap) {
          onTap(e);
        }
        // Swipe detection
        else if (distance >= threshold) {
          const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
          
          if (angle >= -45 && angle <= 45 && onSwipeRight) {
            onSwipeRight(e, { distance, velocity: distance / duration });
          } else if (angle >= 45 && angle <= 135 && onSwipeDown) {
            onSwipeDown(e, { distance, velocity: distance / duration });
          } else if ((angle >= 135 || angle <= -135) && onSwipeLeft) {
            onSwipeLeft(e, { distance, velocity: distance / duration });
          } else if (angle >= -135 && angle <= -45 && onSwipeUp) {
            onSwipeUp(e, { distance, velocity: distance / duration });
          }
        }
      }

      setGestureState({
        isGesturing: false,
        startPoint: null,
        currentPoint: null,
        direction: null,
        distance: 0,
        velocity: 0,
      });
      
      startTouch = null;
      initialDistance = 0;
    };

    return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    };
  };

  const value = {
    isTouch,
    gestureState,
    createGestureHandler,
  };

  return (
    <TouchGestureContext.Provider value={value}>
      {children}
    </TouchGestureContext.Provider>
  );
};

// Hook for swipeable components
export const useSwipeable = (callbacks) => {
  const { createGestureHandler } = useTouchGesture();
  return createGestureHandler(callbacks);
};

// Hook for tap gestures
export const useTapGesture = (onTap, options = {}) => {
  const { createGestureHandler } = useTouchGesture();
  return createGestureHandler({ onTap, ...options });
};

// Hook for long press
export const useLongPress = (onLongPress, delay = 500) => {
  const { createGestureHandler } = useTouchGesture();
  return createGestureHandler({ onLongPress, longPressDelay: delay });
};

// Higher-order component for swipeable elements
export const withSwipe = (WrappedComponent, swipeCallbacks) => {
  return function SwipeableComponent(props) {
    const { createGestureHandler } = useTouchGesture();
    const gestureHandlers = createGestureHandler(swipeCallbacks);
    
    return (
      <div {...gestureHandlers} className="touch-none">
        <WrappedComponent {...props} />
      </div>
    );
  };
};

// Swipeable container component
export const SwipeContainer = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  className = '',
  threshold = 50,
  ...props 
}) => {
  const { createGestureHandler } = useTouchGesture();
  const gestureHandlers = createGestureHandler({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold,
  });

  return (
    <div
      className={`touch-none select-none ${className}`}
      {...gestureHandlers}
      {...props}
    >
      {children}
    </div>
  );
};

export default TouchGestureProvider;
