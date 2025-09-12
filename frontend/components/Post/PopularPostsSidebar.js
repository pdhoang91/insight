// components/Post/PopularPostsSidebar.js
import React from 'react';
import Link from 'next/link';
import { FaHeart, FaArrowRight } from 'react-icons/fa';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { SafeImage, TimeAgo } from '../common';

// Popular Posts Component for Sidebar
export const PopularPostsSidebar = ({ posts = [], isLoading = false }) => {
  const { classes, combineClasses } = useThemeClasses();

  if (isLoading) {
    return (
      <div className={combineClasses(classes.card, 'p-6')}>
        <h3 className={combineClasses(classes.heading.h3, 'mb-4')}>
          Bài viết phổ biến
        </h3>
        <div className={classes.spacing?.stackSmall || 'space-y-4'}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={combineClasses('flex', classes.spacing?.gapSmall || 'gap-3')}>
              <div className={combineClasses(
                'w-16 h-12',
                classes.skeleton || classes.patterns?.skeleton || 'animate-pulse bg-gray-200',
                classes.effects?.rounded || 'rounded'
              )}></div>
              <div className={combineClasses('flex-1', classes.spacing?.stackSmall || 'space-y-2')}>
                <div className={combineClasses(
                  'h-4',
                  classes.skeleton || classes.patterns?.skeleton || 'animate-pulse bg-gray-200',
                  classes.effects?.rounded || 'rounded'
                )}></div>
                <div className={combineClasses(
                  'h-3 w-2/3',
                  classes.skeleton || classes.patterns?.skeleton || 'animate-pulse bg-gray-200',
                  classes.effects?.rounded || 'rounded'
                )}></div>
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
      
      <div className={classes.spacing?.stackSmall || 'space-y-4'}>
        {posts.slice(0, 5).map((post, index) => (
          <Link key={post.id} href={`/p/${post.id}`} className={combineClasses('block group', classes.interactive?.base || 'transition-colors')}>
            <div className={combineClasses('flex', classes.spacing?.gapSmall || 'gap-3')}>
              <div className="flex-shrink-0">
                <span className={combineClasses(
                  'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full',
                  classes.bg?.accent || 'bg-green-500',
                  classes.text?.white || 'text-white'
                )}>
                  {index + 1}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={combineClasses(
                  'font-medium text-sm leading-tight mb-1 line-clamp-2',
                  classes.text?.primary || 'text-gray-900',
                  'group-hover:text-green-600 transition-colors'
                )}>
                  {post.title}
                </h4>
                
                <div className={combineClasses('flex items-center text-xs', classes.spacing?.gapSmall || 'gap-3')}>
                  <span className={classes.text?.muted || 'text-gray-500'}>
                    <TimeAgo timestamp={post.created_at} />
                  </span>
                  
                  <div className={combineClasses('flex items-center gap-1', classes.text?.muted || 'text-gray-500')}>
                    <FaHeart className="w-3 h-3" />
                    <span>{post.clap_count || 0}</span>
                  </div>
                  
                  {post.reading_time && (
                    <span className={classes.text?.muted || 'text-gray-500'}>
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
          classes.text?.accent || 'text-green-600',
          'hover:underline'
        )}
      >
        Xem tất cả
        <FaArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default PopularPostsSidebar;
