// hooks/useBodyScrollLock.js
import { useEffect } from 'react';

/**
 * Locks/unlocks body scroll when isLocked changes.
 * Restores overflow on unmount.
 * @param {boolean} isLocked
 */
export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    document.body.style.overflow = isLocked ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isLocked]);
};
