// components/Shared/EmptyState.js
import React from 'react';
import Link from 'next/link';

const EmptyState = ({ 
  title = "Nothing here yet", 
  message = "Be the first to add content.", 
  action = null,
  icon = null 
}) => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6  rounded-full flex items-center justify-center">
          {icon || (
            <svg 
              className="w-10 h-10 text-medium-text-muted" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-serif font-bold text-medium-text-primary mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="text-medium-text-secondary mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        {action && (
          <div>
            {action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center px-6 py-3 bg-medium-accent-green text-white rounded-full font-medium hover:bg-medium-accent-green/90 transition-colors"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center px-6 py-3 bg-medium-accent-green text-white rounded-full font-medium hover:bg-medium-accent-green/90 transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;