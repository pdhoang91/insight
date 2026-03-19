/**
 * Frog Scrollbar Configuration Module
 * Centralized constants and validation for the frog scrollbar feature.
 */

/**
 * Default configuration object for the frog scrollbar feature.
 * Contains all magic numbers and data attribute selectors.
 * @type {Object}
 */
export const FROG_SCROLLBAR_CONFIG = {
  frogSize: 28,                          // Size in px of frog SVG
  trackPadding: 8,                       // Top/bottom track padding in px
  navOffset: 80,                         // Top offset in px matching fixed navbar height
  railZIndex: 40,                        // Z-index for frog rail overlay (z-40 in Tailwind = 40)
  railWidth: 4,                          // Track rail width in px
  dataAttribute: 'data-frog-scroll',     // HTML attribute name toggled on <html>
  dataRootSelector: 'data-frog-scroll-root',  // Selector on rail root element
  dataTrackSelector: 'data-frog-track',       // Selector on track element
  dataIconSelector: 'data-frog-icon',         // Selector on frog icon element
};

/**
 * Validates a frog scrollbar configuration object.
 * Ensures all required properties exist with correct types and valid values.
 * @param {Object} config - Configuration object to validate
 * @returns {boolean} True if config is valid, false otherwise
 */
export function validateFrogScrollbarConfig(config) {
  // Check if config exists
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Validate numeric properties (must be positive numbers)
  const numericProps = ['frogSize', 'trackPadding', 'navOffset', 'railZIndex', 'railWidth'];
  for (const prop of numericProps) {
    if (typeof config[prop] !== 'number' || config[prop] <= 0) {
      return false;
    }
  }

  // Validate string properties (must be non-empty strings)
  const stringProps = ['dataAttribute', 'dataRootSelector', 'dataTrackSelector', 'dataIconSelector'];
  for (const prop of stringProps) {
    if (typeof config[prop] !== 'string' || config[prop].length === 0) {
      return false;
    }
  }

  return true;
}
