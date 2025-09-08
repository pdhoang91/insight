// hooks/useReadingProgress.js
import { useState, useEffect, useCallback } from 'react';

export const useReadingProgress = (contentRef = null) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Calculate reading time based on content
  const calculateReadingTime = useCallback((content) => {
    if (!content) return 0;
    
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    
    // Average reading speed: 200 words per minute
    const readingSpeed = 200;
    return Math.ceil(wordCount / readingSpeed);
  }, []);

  // Calculate progress and time remaining
  const calculateProgress = useCallback(() => {
    const element = contentRef?.current || document.body;
    if (!element) return;

    const windowHeight = window.innerHeight;
    const documentHeight = element.scrollHeight;
    const scrollTop = window.scrollY;
    
    const totalScrollableHeight = documentHeight - windowHeight;
    const currentProgress = totalScrollableHeight > 0 ? (scrollTop / totalScrollableHeight) * 100 : 0;
    
    const progressPercent = Math.min(100, Math.max(0, currentProgress));
    setProgress(progressPercent);
    
    // Show progress bar after scrolling a bit
    setIsVisible(scrollTop > 100);
    
    // Calculate time remaining
    if (estimatedTime > 0) {
      const remainingPercent = (100 - progressPercent) / 100;
      setTimeRemaining(Math.ceil(estimatedTime * remainingPercent));
    }
  }, [contentRef, estimatedTime]);

  // Initialize reading time when content changes
  useEffect(() => {
    if (contentRef?.current) {
      const content = contentRef.current.textContent || contentRef.current.innerText;
      const time = calculateReadingTime(content);
      setEstimatedTime(time);
      setTimeRemaining(time);
    }
  }, [contentRef, calculateReadingTime]);

  // Set up scroll listeners
  useEffect(() => {
    let rafId = null;
    
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(calculateProgress);
    };

    calculateProgress(); // Initial calculation
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [calculateProgress]);

  return {
    progress,
    isVisible,
    estimatedTime,
    timeRemaining,
    calculateReadingTime
  };
};
