// hooks/useOutsideClick.js
import { useEffect } from 'react';

/**
 * Calls callback when a mousedown event fires outside the given ref.
 * @param {React.RefObject} ref
 * @param {Function} callback
 */
export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback(e);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
};
