// components/Shared/ErrorState.js
import React from 'react';
import Link from 'next/link';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  action = null,
}) => (
  <div className="text-center py-12">
    <div className="max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--bg-surface)]">
        <svg className="w-8 h-8 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <h3 className="font-display text-lg font-bold text-[var(--text)] mb-2">{title}</h3>
      <p className="text-[var(--text-muted)] mb-6">{message}</p>

      {action && (
        action.href ? (
          <Link href={action.href} className="inline-flex items-center px-4 py-2 text-[var(--text-inverse)] bg-[var(--accent)] hover:opacity-90 active:-translate-y-[1px] transition-all" style={{ borderRadius: '3px' }}>
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="inline-flex items-center px-4 py-2 text-[var(--text-inverse)] bg-[var(--accent)] hover:opacity-90 active:-translate-y-[1px] transition-all" style={{ borderRadius: '3px' }}>
            {action.label}
          </button>
        )
      )}
    </div>
  </div>
);

export default ErrorState;
