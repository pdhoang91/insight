// components/Newsletter/Newsletter.js
import React, { useState } from 'react';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const Newsletter = ({ compact = false, className = '' }) => {
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
    <div className={combineClasses(
      themeClasses.bg.accentLight,
      themeClasses.border.accentLight,
      themeClasses.effects.rounded,
      compact ? 'p-4' : themeClasses.spacing.card,
      'bg-gradient-to-br from-medium-accent-green/5 to-medium-accent-green/10 border',
      className
    )}>
      {/* Header */}
      <div className={combineClasses('text-center mb-4')}>
        <div className={combineClasses(
          'w-12 h-12 mx-auto mb-3 flex items-center justify-center',
          themeClasses.bg.accentLight,
          themeClasses.effects.roundedFull
        )}>
          <FaEnvelope className={combineClasses(themeClasses.icons.lg, themeClasses.text.accent)} />
        </div>
        <h3 className={combineClasses(
          themeClasses.typography.h4,
          themeClasses.typography.serif,
          themeClasses.typography.weightBold,
          themeClasses.text.primary,
          'mb-2'
        )}>
          Stay Updated
        </h3>
        <p className={combineClasses(
          themeClasses.typography.bodySmall,
          themeClasses.text.secondary,
          'leading-relaxed'
        )}>
          Get notified when I publish new articles. No spam, unsubscribe at any time.
        </p>
      </div>

      {/* Subscription Form */}
      <form onSubmit={handleSubmit} className={themeClasses.spacing.stackSmall}>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === 'loading' || status === 'success'}
            className={combineClasses(
              themeClasses.interactive.inputBase,
              themeClasses.interactive.inputMedium,
              themeClasses.interactive.input,
              themeClasses.bg.primary,
              status === 'error' 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                : themeClasses.interactive.inputFocus,
              status === 'success' 
                ? 'bg-green-500/20 border-green-500/40' 
                : ''
            )}
          />
          
          {/* Status Icon */}
          {status === 'success' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaCheck className={combineClasses(themeClasses.icons.sm, themeClasses.text.success)} />
            </div>
          )}
          
          {status === 'error' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaTimes className={combineClasses(themeClasses.icons.sm, themeClasses.text.error)} />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={combineClasses(
            themeClasses.interactive.buttonBase,
            themeClasses.interactive.buttonMedium,
            'w-full',
            status === 'loading'
              ? combineClasses(themeClasses.bg.secondary, themeClasses.text.white, 'cursor-not-allowed')
              : status === 'success'
              ? 'bg-green-500/80 text-white cursor-not-allowed'
              : combineClasses(themeClasses.interactive.buttonPrimary, themeClasses.interactions.buttonHover)
          )}
        >
          {status === 'loading' ? (
            <div className={combineClasses('flex items-center justify-center', themeClasses.spacing.gapSmall)}>
              <div className={combineClasses(
                themeClasses.icons.sm,
                'border-2 border-white border-t-transparent rounded-full animate-spin'
              )}></div>
              <span>Subscribing...</span>
            </div>
          ) : status === 'success' ? (
            <div className={combineClasses('flex items-center justify-center', themeClasses.spacing.gapSmall)}>
              <FaCheck className={themeClasses.icons.sm} />
              <span>Subscribed!</span>
            </div>
          ) : (
            'Subscribe'
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div className={combineClasses(
            themeClasses.typography.bodyTiny,
            'text-center p-2',
            themeClasses.effects.rounded,
            status === 'success' 
              ? combineClasses(themeClasses.text.success, 'bg-green-500/20')
              : status === 'error'
              ? combineClasses(themeClasses.text.error, 'bg-red-500/20')
              : ''
          )}>
            {message}
          </div>
        )}
      </form>

      {/* Features */}
      <div className={combineClasses(
        'mt-4 pt-4 border-t',
        themeClasses.border.accentLight
      )}>
        <div className={combineClasses(
          themeClasses.spacing.stackSmall,
          themeClasses.typography.bodyTiny,
          themeClasses.text.muted
        )}>
          <div className={combineClasses('flex items-center', themeClasses.spacing.gapSmall)}>
            <FaCheck className={combineClasses(
              themeClasses.icons.xs,
              themeClasses.text.accent,
              'flex-shrink-0'
            )} />
            <span>Weekly digest of new articles</span>
          </div>
          <div className={combineClasses('flex items-center', themeClasses.spacing.gapSmall)}>
            <FaCheck className={combineClasses(
              themeClasses.icons.xs,
              themeClasses.text.accent,
              'flex-shrink-0'
            )} />
            <span>Exclusive content and insights</span>
          </div>
          <div className={combineClasses('flex items-center', themeClasses.spacing.gapSmall)}>
            <FaCheck className={combineClasses(
              themeClasses.icons.xs,
              themeClasses.text.accent,
              'flex-shrink-0'
            )} />
            <span>No spam, unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
