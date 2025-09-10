// components/Post/ReadingProgressBar.js - Medium 2024 Design
import React, { useState, useEffect } from 'react';

const ReadingProgressBar = ({ contentRef, className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateProgress = () => {
      if (!contentRef?.current) return;

      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.pageYOffset;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;

      // Start showing progress when user scrolls past the header
      const startProgress = elementTop - windowHeight * 0.3;
      const endProgress = elementTop + elementHeight - windowHeight * 0.7;

      if (scrollTop < startProgress) {
        setProgress(0);
        setIsVisible(false);
      } else if (scrollTop > endProgress) {
        setProgress(100);
        setIsVisible(true);
      } else {
        const currentProgress = ((scrollTop - startProgress) / (endProgress - startProgress)) * 100;
        setProgress(Math.min(Math.max(currentProgress, 0), 100));
        setIsVisible(true);
      }

      // Calculate estimated time remaining (assuming 200 words per minute)
      const wordsPerMinute = 200;
      const totalWords = element.textContent?.split(' ').length || 0;
      const wordsRead = (totalWords * progress) / 100;
      const wordsRemaining = totalWords - wordsRead;
      const minutesRemaining = Math.ceil(wordsRemaining / wordsPerMinute);
      setTimeRemaining(Math.max(minutesRemaining, 0));
    };

    const handleScroll = () => {
      requestAnimationFrame(calculateProgress);
    };

    window.addEventListener('scroll', handleScroll);
    calculateProgress(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentRef]);

  return (
    <>
      {/* Progress Bar */}
      <div className={`fixed top-16 left-0 right-0 z-40 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}>
        <div className="h-1 bg-medium-bg-secondary">
          <div 
            className="h-full bg-medium-accent-green transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Reading Stats (Desktop) */}
      <div className={`hidden lg:block fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible && progress > 5 && progress < 95 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <div className="border border-medium-border rounded-card shadow-elevated px-4 py-3">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-medium-border"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                    className="text-medium-accent-green transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-medium-text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div className="text-medium-text-secondary">
                <div className="font-medium">{timeRemaining} min left</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Reading Stats */}
      <div className={`lg:hidden fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 ${
        isVisible && progress > 10 && progress < 90 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <div className="/95 backdrop-blur-sm border border-medium-border rounded-button px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 relative">
                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-medium-border"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                    className="text-medium-accent-green transition-all duration-300"
                  />
                </svg>
              </div>
              <span className="text-medium-text-secondary">
                {Math.round(progress)}% complete
              </span>
            </div>
            <span className="text-medium-text-muted">
              {timeRemaining} min left
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// Hook for reading progress
export const useReadingProgress = (contentRef) => {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const calculateProgress = () => {
      if (!contentRef?.current) return;

      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.pageYOffset;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;

      const startProgress = elementTop - windowHeight * 0.3;
      const endProgress = elementTop + elementHeight - windowHeight * 0.7;

      if (scrollTop < startProgress) {
        setProgress(0);
        setIsReading(false);
      } else if (scrollTop > endProgress) {
        setProgress(100);
        setIsReading(false);
      } else {
        const currentProgress = ((scrollTop - startProgress) / (endProgress - startProgress)) * 100;
        setProgress(Math.min(Math.max(currentProgress, 0), 100));
        setIsReading(true);
      }

      // Calculate time remaining
      const wordsPerMinute = 200;
      const totalWords = element.textContent?.split(' ').length || 0;
      const wordsRead = (totalWords * progress) / 100;
      const wordsRemaining = totalWords - wordsRead;
      const minutesRemaining = Math.ceil(wordsRemaining / wordsPerMinute);
      setTimeRemaining(Math.max(minutesRemaining, 0));
    };

    const handleScroll = () => {
      requestAnimationFrame(calculateProgress);
    };

    window.addEventListener('scroll', handleScroll);
    calculateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentRef]);

  return { progress, timeRemaining, isReading };
};

export default ReadingProgressBar;
