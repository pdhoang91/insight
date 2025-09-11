// components/Reading/ReadingProgress.js
import React, { useState, useEffect } from 'react';

const ReadingProgress = ({ className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
      setIsVisible(scrollTop > 100); // Show after scrolling 100px
    };

    const throttledUpdate = throttle(updateProgress, 16); // ~60fps

    window.addEventListener('scroll', throttledUpdate);
    updateProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', throttledUpdate);
  }, []);

  // Simple throttle function
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 h-1 bg-medium-bg-secondary ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Reading progress: ${Math.round(progress)}%`}
    >
      <div 
        className="h-full bg-medium-accent-green transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
