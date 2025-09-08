// components/Reading/ReadingProgressBar.js
import React, { useState, useEffect } from 'react';

const ReadingProgressBar = ({ target = null, className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateProgress = () => {
      let element;
      
      if (target) {
        // If target is provided, calculate based on that element
        element = typeof target === 'string' ? document.querySelector(target) : target;
      } else {
        // Default: calculate based on document body
        element = document.body;
      }

      if (!element) return;

      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate progress percentage
      const totalScrollableHeight = documentHeight - windowHeight;
      const currentProgress = totalScrollableHeight > 0 ? (scrollTop / totalScrollableHeight) * 100 : 0;
      
      setProgress(Math.min(100, Math.max(0, currentProgress)));
      
      // Show progress bar after scrolling a bit
      setIsVisible(scrollTop > 100);
    };

    // Calculate initial progress
    calculateProgress();

    // Add scroll listener
    const handleScroll = () => {
      requestAnimationFrame(calculateProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [target]);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Progress Bar Background */}
      <div className="h-1 bg-medium-bg-secondary">
        {/* Progress Bar Fill */}
        <div 
          className="h-full bg-medium-accent-green transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ReadingProgressBar;
