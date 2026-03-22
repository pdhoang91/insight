// utils/theme/index.js — Assembles themeClasses from all token modules and re-exports everything

import { bg, text, border } from './tokens';
import { typography, spacing } from './typography';
import { layout, responsive } from './layout';
import { interactive, patterns, icons, effects, animations, interactions } from './interactive';
import { combineClasses, getThemeClass as _getThemeClass, componentClasses, enhancedThemeClasses } from './components';

// Assembled themeClasses object — merges token modules + enhanced classes
export const themeClasses = {
  bg,
  text,
  border,
  typography,
  spacing,
  layout,
  responsive,
  interactive,
  patterns,
  icons,
  effects,
  animations,
  interactions,
  // Merge enhancedThemeClasses sections in
  ...enhancedThemeClasses,
};

// Alias for backward compat
export const getThemeClass = (category, variant = 'primary') =>
  themeClasses[category]?.[variant] || '';

export { combineClasses, componentClasses, enhancedThemeClasses };

export default themeClasses;
