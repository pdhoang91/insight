// components/UI/Button.js
import React, { forwardRef } from 'react';

const BASE = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANTS = {
  primary:   'bg-[var(--accent)] text-[var(--text-inverse)] hover:opacity-90 active:-translate-y-[1px]',
  secondary: 'bg-[var(--bg-surface)] text-[var(--text)] border border-[var(--border-mid)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-strong)] active:-translate-y-[1px]',
  ghost:     'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] active:-translate-y-[1px]',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:-translate-y-[1px]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px] rounded-[3px]',
  md: 'px-4 py-2 text-sm min-h-[44px] rounded-[3px]',
  lg: 'px-6 py-3 text-base min-h-[48px] rounded-[4px]',
};

/**
 * Primary button component aligned to the Insight design system.
 *
 * @param {{ variant?: 'primary'|'secondary'|'ghost'|'danger', size?: 'sm'|'md'|'lg', loading?: boolean, loadingText?: string, fullWidth?: boolean }} props
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false,
  ariaLabel,
  style,
  ...props
}, ref) => {
  const cls = [
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', ...style }}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin w-4 h-4 -ml-1 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? (loadingText ?? children) : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
