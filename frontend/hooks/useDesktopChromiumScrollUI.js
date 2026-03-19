'use client';

import { useState, useEffect } from 'react';

/**
 * Pure function to detect if desktop Chromium scroll UI feature should be enabled.
 * Checks for reduced motion preference, fine pointer support, and Chromium browser.
 *
 * @param {Object} env - Environment detection object
 * @param {string} env.userAgent - Browser user agent string
 * @param {boolean} env.isFinePointer - Whether device supports fine pointer (e.g., mouse)
 * @param {boolean} env.prefersReducedMotion - Whether user prefers reduced motion
 * @returns {Object} Detection result with enabled flag and reason string
 * @returns {boolean} returns.enabled - Whether feature should be enabled
 * @returns {string} returns.reason - Reason for enabled/disabled state
 */
export const detectDesktopChromiumScrollUIEnv = ({
  userAgent,
  isFinePointer,
  prefersReducedMotion,
}) => {
  // Check 1: Reduced motion preference takes priority
  if (prefersReducedMotion) {
    return {
      enabled: false,
      reason: 'reduced-motion',
    };
  }

  // Check 2: Fine pointer support (mouse/trackpad, not touch)
  if (!isFinePointer) {
    return {
      enabled: false,
      reason: 'touch-or-coarse-pointer',
    };
  }

  // Check 3: Chromium browser detection (case-sensitive 'Chrome' check)
  if (!userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
    return {
      enabled: false,
      reason: 'not-chromium',
    };
  }

  // All checks passed
  return {
    enabled: true,
    reason: 'desktop-chromium',
  };
};

/**
 * React hook to detect if desktop Chromium scroll UI feature should be enabled.
 * Safely reads browser capabilities on client-side only (SSR-safe).
 *
 * @returns {Object} Detection result with enabled flag and reason string
 * @returns {boolean} returns.enabled - Whether feature should be enabled
 * @returns {string} returns.reason - Reason for enabled/disabled state
 */
export const useDesktopChromiumScrollUI = () => {
  const [state, setState] = useState({
    enabled: false,
    reason: 'ssr',
  });

  useEffect(() => {
    function detect() {
      // Read browser capabilities
      const userAgent = navigator.userAgent;
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // Detect environment and update state
      setState(
        detectDesktopChromiumScrollUIEnv({
          userAgent,
          isFinePointer,
          prefersReducedMotion,
        })
      );
    }

    detect();
  }, []);

  return state;
};
