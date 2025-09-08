// components/widgets/SidebarWidgets.js - Consolidated Sidebar Widgets
import React, { useState } from 'react';
import Link from 'next/link';
import { FaHeart, FaCalendarAlt, FaEnvelope, FaArrowRight, FaEye } from 'react-icons/fa';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { SafeImage, TimeAgo } from '../common';

// Popular Posts Widget
export const PopularPostsWidget = ({ posts = [], isLoading = false }) => {
  const { classes, combineClasses } = useThemeClasses();

  if (isLoading) {
    return (
      <div className={combineClasses(classes.card, 'p-6')}>
        <h3 className={combineClasses(classes.heading.h3, 'mb-4')}>
          Bài viết phổ biến
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className={`w-16 h-12 ${classes.skeleton} rounded`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-4 ${classes.skeleton} rounded`}></div>
                <div className={`h-3 ${classes.skeleton} rounded w-2/3`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={combineClasses(classes.card, 'p-6')}>
      <h3 className={combineClasses(classes.heading.h3, 'mb-4')}>
        Bài viết phổ biến
      </h3>
      
      <div className="space-y-4">
        {posts.slice(0, 5).map((post, index) => (
          <Link key={post.id} href={`/p/${post.id}`} className="block group">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <span className={combineClasses(
                  'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full',
                  classes.bg.accent,
                  'text-white'
                )}>
                  {index + 1}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={combineClasses(
                  'font-medium text-sm leading-tight mb-1 line-clamp-2',
                  classes.text.primary,
                  'group-hover:text-medium-accent-green transition-colors'
                )}>
                  {post.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs">
                  <span className={classes.text.muted}>
                    <TimeAgo timestamp={post.created_at} />
                  </span>
                  
                  <div className={combineClasses('flex items-center gap-1', classes.text.muted)}>
                    <FaHeart className="w-3 h-3" />
                    <span>{post.clap_count || 0}</span>
                  </div>
                  
                  {post.reading_time && (
                    <span className={classes.text.muted}>
                      {post.reading_time} min
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <Link 
        href="/popular" 
        className={combineClasses(
          'inline-flex items-center gap-2 mt-4 text-sm font-medium',
          classes.text.accent,
          'hover:underline'
        )}
      >
        Xem tất cả
        <FaArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

// Archive Widget
export const ArchiveWidget = ({ archives = [], isLoading = false }) => {
  const { classes, combineClasses } = useThemeClasses();

  if (isLoading) {
    return (
      <div className={combineClasses(classes.card, 'p-6')}>
        <h3 className={combineClasses(classes.heading.h3, 'mb-4')}>
          Lưu trữ
        </h3>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={`h-4 ${classes.skeleton} rounded`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={combineClasses(classes.card, 'p-6')}>
      <h3 className={combineClasses(classes.heading.h3, 'mb-4 flex items-center gap-2')}>
        <FaCalendarAlt className={`w-4 h-4 ${classes.text.accent}`} />
        Lưu trữ
      </h3>
      
      <div className="space-y-2">
        {archives.map((archive) => (
          <Link
            key={`${archive.year}-${archive.month}`}
            href={`/archive/${archive.year}/${archive.month}`}
            className={combineClasses(
              'flex items-center justify-between py-2 px-3 rounded-lg transition-colors',
              classes.text.secondary,
              'hover:bg-medium-bg-secondary hover:text-medium-accent-green'
            )}
          >
            <span className="text-sm">
              Tháng {archive.month}/{archive.year}
            </span>
            <span className={combineClasses('text-xs', classes.text.muted)}>
              ({archive.count})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Newsletter Widget
export const NewsletterWidget = ({ onSubscribe, isLoading = false }) => {
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

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          className={classes.input}
          required
          disabled={isSubmitting}
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className={combineClasses(
            classes.button.primary,
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

// Reading Progress Widget
export const ReadingProgressWidget = ({ progress = 0, readingTime = 0 }) => {
  const { classes, combineClasses } = useThemeClasses();

  return (
    <div className={combineClasses(classes.card, 'p-4')}>
      <div className="flex items-center gap-3 mb-3">
        <FaEye className={`w-4 h-4 ${classes.text.accent}`} />
        <span className={combineClasses('text-sm font-medium', classes.text.primary)}>
          Tiến độ đọc
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={combineClasses('text-xs', classes.text.muted)}>
              Đã đọc
            </span>
            <span className={combineClasses('text-xs font-medium', classes.text.primary)}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className={combineClasses('w-full h-2 rounded-full', classes.bg.secondary)}>
            <div 
              className={combineClasses('h-full rounded-full transition-all duration-300', classes.bg.accent)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {readingTime > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <FaEye className={`w-3 h-3 ${classes.text.muted}`} />
            <span className={classes.text.muted}>
              {readingTime} phút đọc
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
