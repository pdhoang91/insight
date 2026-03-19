'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Pure function: calculates scroll progress as a value between 0 and 1.
 * Returns 0 if there is no scrollable range (scrollHeight <= viewportHeight).
 */
export function calculateScrollProgress(scrollY, scrollHeight, viewportHeight) {
  if (scrollHeight <= viewportHeight) {
    return 0;
  }
  return Math.min(1, Math.max(0, scrollY / (scrollHeight - viewportHeight)));
}

/**
 * React hook that tracks full-page scroll progress with rAF batching,
 * resize support, and a no-scroll guard.
 *
 * @returns {{ progress: number, direction: 'up'|'down', hasScrollableRange: boolean }}
 */
export function useScrollProgress() {
  const [state, setState] = useState({
    progress: 0,
    direction: 'up',
    hasScrollableRange: false,
  });

  const lastScrollY = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    function update() {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      const hasScrollableRange = scrollHeight > viewportHeight;
      const progress = calculateScrollProgress(scrollY, scrollHeight, viewportHeight);
      const direction = scrollY > lastScrollY.current ? 'down' : 'up';

      lastScrollY.current = scrollY;

      setState({ progress, direction, hasScrollableRange });
    }

    function scheduleUpdate() {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        update();
      });
    }

    update();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, []);

  return state;
}
