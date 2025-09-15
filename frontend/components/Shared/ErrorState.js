// components/Shared/ErrorState.js
import React from 'react';
import Link from 'next/link';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const ErrorState = ({ 
  title = "Đã xảy ra lỗi", 
  message = "Có lỗi xảy ra. Vui lòng thử lại.", 
  action = null 
}) => {
  return (
    <div className={combineClasses(
      'text-center py-12'
    )}>
      <div className={combineClasses(
        'max-w-md mx-auto'
      )}>
        {/* Error Icon */}
        <div className={combineClasses(
          'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
          themeClasses.bg.secondary
        )}>
          <svg 
            className={combineClasses(
              themeClasses.icons.lg,
              themeClasses.text.muted
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className={combineClasses(
          themeClasses.typography.h3,
          themeClasses.typography.serif,
          themeClasses.typography.weightBold,
          themeClasses.text.primary,
          'mb-2'
        )}>
          {title}
        </h3>

        {/* Message */}
        <p className={combineClasses(
          themeClasses.text.secondary,
          'mb-6'
        )}>
          {message}
        </p>

        {/* Action Button */}
        {action && (
          <div>
            {action.href ? (
              <Link
                href={action.href}
                className={combineClasses(
                  'inline-flex items-center px-4 py-2 text-white',
                  themeClasses.bg.accent,
                  themeClasses.effects.rounded,
                  themeClasses.bg.accentHover,
                  themeClasses.animations.smooth
                )}
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className={combineClasses(
                  'inline-flex items-center px-4 py-2 text-white',
                  themeClasses.bg.accent,
                  themeClasses.effects.rounded,
                  themeClasses.bg.accentHover,
                  themeClasses.animations.smooth
                )}
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

export default ErrorState;