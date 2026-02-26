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
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[#f2f2f2]">
        {icon || (
          <svg className="w-10 h-10 text-[#b3b3b1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>

      <h3 className="font-serif text-xl font-bold text-[#292929] mb-3">{title}</h3>
      <p className="text-[#757575] mb-8 leading-relaxed">{message}</p>

      {action && (
        action.href ? (
          <Link href={action.href} className="inline-flex items-center px-6 py-3 text-white rounded-full bg-[#1a8917] hover:bg-[#156d12] transition-colors">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="inline-flex items-center px-6 py-3 text-white rounded-full bg-[#1a8917] hover:bg-[#156d12] transition-colors">
            {action.label}
          </button>
        )
      )}
    </div>
  </div>
);

export default EmptyState;
