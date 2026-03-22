// utils/theme/components.js — Composed component classes built from token modules

import { bg, text, border } from './tokens';
import { typography, spacing } from './typography';
import { layout, responsive } from './layout';
import { interactive, patterns, icons, effects, animations, interactions } from './interactive';

export const combineClasses = (...classes) => classes.filter(Boolean).join(' ');

export const getThemeClass = (themeClasses, category, variant = 'primary') =>
  themeClasses[category]?.[variant] || '';

// ---------------------------------------------------------------------------
// componentClasses — pre-composed shorthand strings for common UI patterns
// ---------------------------------------------------------------------------
export const componentClasses = {
  navbar: combineClasses(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    bg.primary + '/95',
    effects.blur,
    border.primary,
    'border-b shadow-sm'
  ),

  postCard: combineClasses(
    interactive.cardBase,
    effects.rounded,
    spacing.card
  ),

  button: {
    primaryLarge: combineClasses(interactive.buttonBase, interactive.buttonLarge, interactive.buttonPrimary),
    secondaryLarge: combineClasses(interactive.buttonBase, interactive.buttonLarge, interactive.buttonSecondary),
    ghostLarge: combineClasses(interactive.buttonBase, interactive.buttonLarge, interactive.buttonGhost),

    primary: combineClasses(interactive.buttonBase, interactive.buttonMedium, interactive.buttonPrimary, interactions.buttonHover),
    primaryMagnetic: combineClasses(interactive.buttonBase, interactive.buttonMedium, interactive.buttonPrimary, interactions.buttonMagnetic),
    secondary: combineClasses(interactive.buttonBase, interactive.buttonMedium, interactive.buttonSecondary, interactions.buttonHoverSubtle),
    ghost: combineClasses(interactive.buttonBase, interactive.buttonMedium, interactive.buttonGhost, interactions.buttonHoverSubtle),
    danger: combineClasses(interactive.buttonBase, interactive.buttonMedium, interactive.buttonDanger, interactions.buttonHover),

    primarySmall: combineClasses(interactive.buttonBase, interactive.buttonSmall, interactive.buttonPrimary),
    secondarySmall: combineClasses(interactive.buttonBase, interactive.buttonSmall, interactive.buttonSecondary),
    ghostSmall: combineClasses(interactive.buttonBase, interactive.buttonSmall, interactive.buttonGhost),
  },

  input: {
    large: combineClasses(interactive.inputBase, interactive.inputLarge, interactive.input),
    medium: combineClasses(interactive.inputBase, interactive.inputMedium, interactive.input),
    small: combineClasses(interactive.inputBase, interactive.inputSmall, interactive.input),
  },

  textarea: {
    large: combineClasses(interactive.inputBase, interactive.inputLarge, interactive.input, 'resize-none min-h-[120px]'),
    medium: combineClasses(interactive.inputBase, interactive.inputMedium, interactive.input, 'resize-none min-h-[100px]'),
    small: combineClasses(interactive.inputBase, interactive.inputSmall, interactive.input, 'resize-none min-h-[80px]'),
  },

  card: {
    base: combineClasses(interactive.cardBase, spacing.card),
    hover: combineClasses(interactive.cardBase, interactive.cardHover, spacing.card),
    hoverSubtle: combineClasses(interactive.cardBase, interactive.cardHoverSubtle, spacing.card),
    float: combineClasses(interactive.cardBase, interactive.cardFloat, spacing.card),
    clickable: combineClasses(interactive.cardBase, interactive.cardClickable, spacing.card),
  },

  heading: {
    h1: combineClasses(typography.h1, text.primary),
    h2: combineClasses(typography.h2, text.primary),
    h3: combineClasses(typography.h3, text.primary),
    h4: combineClasses(typography.h4, text.primary),
    h5: combineClasses(typography.h5, text.primary),
    h6: combineClasses(typography.h6, text.primary),
    display: combineClasses(typography.displayLarge, text.primary),
    article: combineClasses(typography.displayMedium, text.primary),
  },

  text: {
    displayHero: combineClasses(typography.displayHero, text.primary),
    displayLarge: combineClasses(typography.displayLarge, text.primary),
    displayMedium: combineClasses(typography.displayMedium, text.primary),

    bodyHero: combineClasses(typography.bodyHero, text.primary),
    bodyLarge: combineClasses(typography.bodyLarge, text.primary),
    body: combineClasses(typography.bodyMedium, text.primary),
    bodySmall: combineClasses(typography.bodySmall, text.secondary),
    bodyTiny: combineClasses(typography.bodyTiny, text.muted),

    buttonLarge: typography.buttonLarge,
    buttonMedium: typography.buttonMedium,
    buttonSmall: typography.buttonSmall,
    labelLarge: combineClasses(typography.labelLarge, text.secondary),
    labelMedium: combineClasses(typography.labelMedium, text.secondary),
    labelSmall: combineClasses(typography.labelSmall, text.muted),
    caption: typography.captionText,

    code: combineClasses(typography.code, text.primary),
    quote: combineClasses(typography.quote, text.secondary),
    subtitle: typography.subtitle,
  },

  page: combineClasses(layout.fullHeight, bg.primary),
  pageLoading: combineClasses(layout.fullHeight, patterns.loadingState),
  pageError: combineClasses(layout.fullHeight, patterns.errorState),
};

// ---------------------------------------------------------------------------
// enhancedThemeClasses — additional component patterns
// ---------------------------------------------------------------------------
export const enhancedThemeClasses = {
  error: {
    text: 'text-red-500',
    textLight: 'text-red-400',
    border: 'border-red-500',
    borderLight: 'border-red-300',
    bg: 'bg-red-50',
    bgDark: 'bg-red-100',
    ring: 'ring-red-500',
    ringLight: 'ring-red-300',
    focus: 'focus:border-red-500 focus:ring-red-500',
  },

  success: {
    text: 'text-green-500',
    textLight: 'text-green-400',
    border: 'border-green-500',
    borderLight: 'border-green-300',
    bg: 'bg-green-50',
    bgDark: 'bg-green-100',
    ring: 'ring-green-500',
    ringLight: 'ring-green-300',
  },

  warning: {
    text: 'text-yellow-500',
    textLight: 'text-yellow-400',
    border: 'border-yellow-500',
    borderLight: 'border-yellow-300',
    bg: 'bg-yellow-50',
    bgDark: 'bg-yellow-100',
    ring: 'ring-yellow-500',
    ringLight: 'ring-yellow-300',
  },

  form: {
    label: combineClasses('block mb-2', typography.labelMedium, text.primary),
    labelRequired: combineClasses('block mb-2', typography.labelMedium, text.primary, 'after:content-["*"] after:ml-0.5 after:text-red-500'),
    helperText: combineClasses('mt-2', typography.bodyTiny, text.muted),
    errorText: combineClasses('mt-2', typography.bodyTiny, 'text-red-500'),
    successText: combineClasses('mt-2', typography.bodyTiny, 'text-green-500'),
    fieldset: 'space-y-4',
    fieldsetLarge: 'space-y-6',
    group: 'space-y-2',
    groupInline: 'flex items-center space-x-3',
  },

  prose: {
    small: 'prose prose-sm max-w-none prose-slate',
    base: 'prose prose-base max-w-none prose-slate',
    large: 'prose prose-lg max-w-none prose-slate',
    xl: 'prose prose-xl max-w-none prose-slate',
    compact: 'prose prose-sm max-w-none prose-slate prose-p:my-2 prose-headings:my-3',
    relaxed: 'prose prose-base max-w-none prose-slate prose-p:my-4 prose-headings:my-6',
  },

  utils: {
    divider: combineClasses('border-t', border.primary, 'my-4'),
    dividerVertical: combineClasses('border-l', border.primary, 'mx-4'),
    dividerDashed: combineClasses('border-t border-dashed', border.primary, 'my-4'),

    section: 'mb-6 sm:mb-8',
    sectionLarge: 'mb-8 sm:mb-12 lg:mb-16',
    sectionSmall: 'mb-4 sm:mb-6',

    hidden: 'hidden',
    block: 'block',
    flex: 'flex',
    grid: 'grid',
    inlineBlock: 'inline-block',
    inlineFlex: 'inline-flex',

    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',

    overflowHidden: 'overflow-hidden',
    overflowAuto: 'overflow-auto',
    overflowScroll: 'overflow-scroll',

    truncate: 'truncate',
    textEllipsis: 'text-ellipsis overflow-hidden',
    srOnly: 'sr-only',
    notSrOnly: 'not-sr-only',

    full: 'w-full h-full',
    fullWidth: 'w-full',
    fullHeight: 'h-full',
    fullScreen: 'w-screen h-screen',
  },

  modal: {
    overlay: combineClasses('fixed inset-0 z-50 flex items-center justify-center', bg.primary + '/80', effects.blur),
    content: combineClasses('relative w-full max-w-md mx-4 p-6', bg.elevated, effects.rounded, effects.shadowLayeredLg, border.primary, 'border'),
    contentLarge: combineClasses('relative w-full max-w-2xl mx-4 p-8', bg.elevated, effects.rounded, effects.shadowLayeredLg, border.primary, 'border'),
    header: combineClasses('pb-4 border-b', border.primary),
    footer: combineClasses('pt-4 border-t', border.primary, 'flex justify-end space-x-3'),
    closeButton: combineClasses('absolute top-4 right-4 p-1 rounded-full', text.muted, 'hover:text-medium-text-primary hover:bg-medium-hover', animations.smooth),
  },

  tag: {
    base: combineClasses('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', animations.smooth),
    primary: combineClasses('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', bg.accent, text.white, 'hover:bg-medium-accent-green/90'),
    secondary: combineClasses('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', bg.secondary, text.secondary, 'hover:bg-medium-hover'),
    outline: combineClasses('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border', border.primary, text.secondary, 'hover:bg-medium-hover'),
  },

  list: {
    base: 'space-y-2',
    compact: 'space-y-1',
    relaxed: 'space-y-4',
    horizontal: 'flex flex-wrap gap-2',
    horizontalSpaced: 'flex flex-wrap gap-4',
    grid: 'grid grid-cols-1 gap-4',
    gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  },

  avatar: {
    xs: 'w-6 h-6 rounded-full',
    sm: 'w-8 h-8 rounded-full',
    md: 'w-10 h-10 rounded-full',
    lg: 'w-12 h-12 rounded-full',
    xl: 'w-16 h-16 rounded-full',
    '2xl': 'w-20 h-20 rounded-full',
    square: 'rounded-lg',
    squareSmall: 'w-8 h-8 rounded-md',
    squareLarge: 'w-16 h-16 rounded-lg',
  },

  loading: {
    spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-medium-accent-green',
    pulse: combineClasses('animate-pulse', bg.secondary),
    skeleton: combineClasses('animate-pulse rounded', 'bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary', 'bg-[length:200%_100%]'),
    skeletonText: combineClasses('animate-pulse rounded h-4', 'bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary', 'bg-[length:200%_100%]'),
    skeletonAvatar: combineClasses('animate-pulse rounded-full', 'bg-gradient-to-r from-medium-bg-secondary via-medium-hover to-medium-bg-secondary', 'bg-[length:200%_100%]'),
  },

  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-medium-accent-green focus:ring-offset-2',
    ringInset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-medium-accent-green',
    visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medium-accent-green focus-visible:ring-offset-2',
  },

  status: {
    online: combineClasses('bg-green-500', 'w-2 h-2 rounded-full'),
    offline: combineClasses('bg-gray-400', 'w-2 h-2 rounded-full'),
    pending: combineClasses('bg-yellow-500', 'w-2 h-2 rounded-full'),
    error: combineClasses('bg-red-500', 'w-2 h-2 rounded-full'),
    success: combineClasses('bg-green-500', 'w-2 h-2 rounded-full'),
  },

  badge: {
    primary: combineClasses(bg.accent, text.white, 'px-2 py-1 rounded-full text-xs font-medium', animations.smooth),
    secondary: combineClasses(bg.secondary, text.secondary, 'px-2 py-1 rounded-full text-xs font-medium', animations.smooth),
    outline: combineClasses('border', border.primary, text.secondary, 'px-2 py-1 rounded-full text-xs font-medium bg-transparent', animations.smooth),
    count: combineClasses('bg-red-500 text-white', 'px-1.5 py-0.5 rounded-full text-xs font-medium', 'min-w-[1.25rem] h-5 flex items-center justify-center', animations.smooth),
    notification: combineClasses(bg.accent, text.white, 'w-2 h-2 rounded-full absolute -top-1 -right-1', 'animate-pulse'),
  },

  menu: {
    container: combineClasses(bg.elevated, border.primary, effects.shadowLayeredMd, 'border rounded-lg py-2 min-w-[12rem]', animations.smooth),
    item: combineClasses('px-4 py-2 text-sm cursor-pointer flex items-center gap-3', text.primary, 'hover:bg-medium-hover', animations.smooth),
    itemDanger: combineClasses('px-4 py-2 text-sm cursor-pointer flex items-center gap-3', 'text-red-600 hover:bg-red-50 hover:text-red-700', animations.smooth),
    divider: combineClasses('my-2 border-t', border.primary),
  },

  search: {
    container: combineClasses('relative flex items-center', animations.smooth),
    input: combineClasses(interactive.inputBase, interactive.inputMedium, interactive.input, 'pl-10 pr-4'),
    icon: combineClasses('absolute left-3 top-1/2 transform -translate-y-1/2', icons.sm, text.muted),
    results: combineClasses('absolute top-full left-0 right-0 z-50 mt-2', bg.elevated, border.primary, effects.shadowLayeredMd, 'border rounded-lg max-h-96 overflow-y-auto'),
  },
};
