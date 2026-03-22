// hooks/useScrollEffect.js
import { useState, useEffect } from 'react';

/**
 * Returns true when window.scrollY exceeds the given threshold.
 * @param {number} threshold - default 20px
 * @returns {boolean}
 */
export const useScrollEffect = (threshold = 20) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
};
