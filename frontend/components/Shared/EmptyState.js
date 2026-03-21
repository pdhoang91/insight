// components/Shared/EmptyState.js
import React from 'react';
import Link from 'next/link';

const EmptyState = ({
  title = 'No content yet',
  message = 'Be the first to add content.',
  action = null,
  icon = null,
}) => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--bg-surface)]">
        {icon || (
          <svg className="w-10 h-10 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>

      <h3 className="font-display text-xl font-bold text-[var(--text)] mb-3">{title}</h3>
      <p className="text-[var(--text-muted)] mb-8 leading-relaxed">{message}</p>

      {action && (
        action.href ? (
          <Link href={action.href} className="inline-flex items-center px-6 py-3 text-[var(--text-inverse)] bg-[var(--accent)] hover:opacity-90 active:-translate-y-[1px] transition-all" style={{ borderRadius: '3px' }}>
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="inline-flex items-center px-6 py-3 text-[var(--text-inverse)] bg-[var(--accent)] hover:opacity-90 active:-translate-y-[1px] transition-all" style={{ borderRadius: '3px' }}>
            {action.label}
          </button>
        )
      )}
    </div>
  </div>
);

export default EmptyState;
