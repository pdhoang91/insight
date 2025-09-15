// components/Shared/EmptyState.js
import React from 'react';
import Link from 'next/link';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const EmptyState = ({ 
  title = "Chưa có nội dung", 
  message = "Hãy là người đầu tiên thêm nội dung.", 
  action = null,
  icon = null 
}) => {
  return (
    <div className={combineClasses(
      'text-center py-16'
    )}>
      <div className={combineClasses(
        'max-w-md mx-auto'
      )}>
        {/* Icon */}
        <div className={combineClasses(
          'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
          themeClasses.bg.secondary
        )}>
          {icon || (
            <svg 
              className={combineClasses(
                'w-10 h-10',
                themeClasses.text.muted
              )} 
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
        <h3 className={combineClasses(
          themeClasses.typography.h2,
          themeClasses.typography.serif,
          themeClasses.typography.weightBold,
          themeClasses.text.primary,
          'mb-3'
        )}>
          {title}
        </h3>

        {/* Message */}
        <p className={combineClasses(
          themeClasses.text.secondary,
          'mb-8 leading-relaxed'
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
                  'inline-flex items-center px-6 py-3 text-white rounded-full font-medium',
                  themeClasses.bg.accent,
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
                  'inline-flex items-center px-6 py-3 text-white rounded-full font-medium',
                  themeClasses.bg.accent,
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

export default EmptyState;