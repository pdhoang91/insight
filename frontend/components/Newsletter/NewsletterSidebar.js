// components/Newsletter/NewsletterSidebar.js
import React, { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { useThemeClasses } from '../../hooks/useThemeClasses';

// Newsletter Component for Sidebar
export const NewsletterSidebar = ({ onSubscribe, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { classes, combineClasses } = useThemeClasses();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubscribe(email);
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={combineClasses(classes.card, 'p-6')}>
      <div className="text-center mb-4">
        <div className={combineClasses(
          'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
          classes.bg.accentLight
        )}>
          <FaEnvelope className={`w-6 h-6 ${classes.text.accent}`} />
        </div>
        
        <h3 className={combineClasses(classes.heading.h3, 'mb-2')}>
          Đăng ký nhận tin
        </h3>
        
        <p className={combineClasses('text-sm', classes.text.secondary)}>
          Nhận thông báo về những bài viết mới nhất
        </p>
      </div>

      <form onSubmit={handleSubmit} className={classes.spacing?.stackSmall || 'space-y-3'}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          className={classes.input || combineClasses(
            'w-full px-3 py-2 border rounded-lg',
            'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200',
            'transition-colors'
          )}
          required
          disabled={isSubmitting}
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className={combineClasses(
            classes.button?.primary || 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors',
            'w-full justify-center',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      
      <p className={combineClasses('text-xs mt-3 text-center', classes.text.muted)}>
        Chúng tôi không spam. Bạn có thể hủy đăng ký bất cứ lúc nào.
      </p>
    </div>
  );
};

export default NewsletterSidebar;
