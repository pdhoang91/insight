// components/Utils/ErrorBoundary.js
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={combineClasses(
          'min-h-[200px] flex items-center justify-center p-8',
          themeClasses.bg.card || themeClasses.bg.primary,
          themeClasses.effects.rounded,
          themeClasses.border.primary,
          'border'
        )}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-500" 
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
            <h3 className={combineClasses(
              themeClasses.typography.h4,
              themeClasses.text.primary,
              'mb-2'
            )}>
              Đã xảy ra lỗi
            </h3>
            <p className={combineClasses(
              themeClasses.text.secondary,
              'mb-4'
            )}>
              Chúng tôi gặp lỗi khi tải component này.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className={combineClasses(
                'px-4 py-2 rounded-md text-white',
                themeClasses.bg.accent,
                'hover:bg-medium-accent-green/90',
                themeClasses.animations.smooth
              )}
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
