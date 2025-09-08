// components/Widgets/NewsletterWidget.js
import React, { useState } from 'react';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

const NewsletterWidget = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    try {
      // TODO: Implement newsletter subscription API
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus('success');
      setMessage('Thanks for subscribing! Check your email for confirmation.');
      setEmail('');
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      
      // Reset error after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-medium-accent-green/5 to-medium-accent-green/10 rounded-lg p-6 border border-medium-accent-green/20 ${className}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-medium-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaEnvelope className="w-6 h-6 text-medium-accent-green" />
        </div>
        <h3 className="text-lg font-serif font-bold text-medium-text-primary mb-2">
          Stay Updated
        </h3>
        <p className="text-sm text-medium-text-secondary leading-relaxed">
          Get notified when I publish new articles. No spam, unsubscribe at any time.
        </p>
      </div>

      {/* Subscription Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === 'loading' || status === 'success'}
            className={`w-full px-4 py-3 text-sm border rounded-lg bg-medium-bg-primary text-medium-text-primary placeholder-medium-text-muted focus:outline-none focus:ring-2 transition-colors ${
              status === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : 'border-medium-border focus:ring-medium-accent-green/20 focus:border-medium-accent-green'
            } ${
              status === 'success' 
                ? 'bg-green-50 border-green-300' 
                : ''
            }`}
          />
          
          {/* Status Icon */}
          {status === 'success' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaCheck className="w-4 h-4 text-green-500" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaTimes className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            status === 'loading'
              ? 'bg-medium-text-muted text-white cursor-not-allowed'
              : status === 'success'
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-medium-accent-green text-white hover:bg-medium-accent-green/90'
          }`}
        >
          {status === 'loading' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Subscribing...</span>
            </div>
          ) : status === 'success' ? (
            <div className="flex items-center justify-center space-x-2">
              <FaCheck className="w-4 h-4" />
              <span>Subscribed!</span>
            </div>
          ) : (
            'Subscribe'
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div className={`text-xs text-center p-2 rounded ${
            status === 'success' 
              ? 'text-green-700 bg-green-50' 
              : status === 'error'
              ? 'text-red-700 bg-red-50'
              : ''
          }`}>
            {message}
          </div>
        )}
      </form>

      {/* Features */}
      <div className="mt-4 pt-4 border-t border-medium-accent-green/20">
        <div className="space-y-2 text-xs text-medium-text-muted">
          <div className="flex items-center space-x-2">
            <FaCheck className="w-3 h-3 text-medium-accent-green flex-shrink-0" />
            <span>Weekly digest of new articles</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCheck className="w-3 h-3 text-medium-accent-green flex-shrink-0" />
            <span>Exclusive content and insights</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaCheck className="w-3 h-3 text-medium-accent-green flex-shrink-0" />
            <span>No spam, unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterWidget;
