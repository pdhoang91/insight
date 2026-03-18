'use client';

import React, { Component } from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          {...this.props}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ 
  error, 
  errorInfo, 
  resetError, 
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: {
      container: 'min-h-[400px] flex items-center justify-center',
      icon: 'w-16 h-16 text-red-500',
      title: 'text-xl font-bold text-slate-900',
      message: 'text-slate-600'
    },
    inline: {
      container: 'py-8 text-center',
      icon: 'w-12 h-12 text-red-500',
      title: 'text-lg font-semibold text-slate-900',
      message: 'text-sm text-slate-600'
    },
    minimal: {
      container: 'py-4 text-center',
      icon: 'w-8 h-8 text-red-500',
      title: 'text-base font-medium text-slate-900',
      message: 'text-xs text-slate-600'
    }
  };

  const style = variants[variant];

  return (
    <div className={`${style.container} ${className}`}>
      <motion.div 
        className="text-center max-w-md mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Error Icon with Animation */}
        <motion.div 
          className="mx-auto bg-red-50 rounded-full p-4 w-fit"
          animate={{ 
            rotate: [0, -5, 5, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg 
            className={style.icon}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <motion.path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        {/* Error Content */}
        <div className="space-y-3">
          <h3 className={style.title}>
            Có lỗi xảy ra
          </h3>
          
          <p className={style.message}>
            Rất tiếc, một lỗi không mong muốn đã xảy ra. 
            Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục.
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && error && (
            <motion.details 
              className="text-left mt-4 p-4 bg-red-50 rounded-lg text-xs"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.5 }}
            >
              <summary className="cursor-pointer font-medium text-red-800 mb-2">
                Chi tiết lỗi (Development)
              </summary>
              <pre className="whitespace-pre-wrap text-red-700 text-xs overflow-auto">
                {error.toString()}
                {errorInfo && errorInfo.componentStack}
              </pre>
            </motion.details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <motion.button
            onClick={resetError}
            className="inline-flex items-center px-4 py-2 bg-[var(--accent)] text-white 
                       font-display font-medium rounded-full hover:bg-[var(--accent-dark)]
                       transition-colors duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Thử lại
          </motion.button>

          <motion.button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 
                       font-display font-medium rounded-full hover:bg-slate-200
                       transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            Về trang chủ
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// Hook for functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return { captureError, resetError };
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;