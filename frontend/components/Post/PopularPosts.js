// components/Post/PopularPosts.js
import React from 'react';
import Link from 'next/link';
import { FaFire, FaEye, FaComment, FaHeart } from 'react-icons/fa';
import { usePopularPosts, useRecentPosts } from '../../hooks/useRecentPosts';
import { themeClasses, combineClasses } from '../../utils/themeClasses';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

// Individual Popular Post Item
const PopularPostItem = ({ post, rank, showImages }) => {
  return (
    <article>
      <Link 
        href={`/p/${post.title_name}`} 
        className={combineClasses(
          'flex items-center justify-between py-1 px-2 group',
          themeClasses.effects.rounded,
          'hover:bg-medium-accent-green/5',
          themeClasses.animations.smooth
        )}
      >
        <span className={combineClasses(
          themeClasses.text.bodySmall,
          'lg:text-base',
          themeClasses.text.secondary,
          'group-hover:text-medium-accent-green',
          'line-clamp-2'
        )}>
          {post.title}
        </span>
        <div className={combineClasses(
          'flex items-center flex-shrink-0 ml-2',
          themeClasses.spacing.gapSmall,
          themeClasses.text.xs,
          themeClasses.text.muted
        )}>
          {/* Views */}
          {post.view_count > 0 && (
            <div className={combineClasses(
              'flex items-center',
              themeClasses.spacing.gapTiny
            )}>
              <FaEye className={themeClasses.icons.xs} />
              <span>{post.view_count}</span>
            </div>
          )}
          {/* Comments */}
          {post.comment_count > 0 && (
            <div className={combineClasses(
              'flex items-center',
              themeClasses.spacing.gapTiny
            )}>
              <FaComment className={themeClasses.icons.xs} />
              <span>{post.comment_count}</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

const PopularPosts = ({ 
  limit = 5, 
  timeframe = 'week', // 'week', 'month', 'all'
  showImages = true,
  className = '' 
}) => {
  const { posts: popularPosts, isLoading, isError } = usePopularPosts(limit);
  const { posts: recentPosts } = useRecentPosts(limit);
  
  // Fallback to recent posts if popular posts fail
  const displayPosts = isError ? recentPosts : popularPosts;

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      case 'all': return 'Tất cả';
      default: return 'Phổ biến';
    }
  };

  if (isLoading) {
    return (
      <div className={combineClasses(
        themeClasses.interactive.cardBase,
        themeClasses.spacing.card,
        themeClasses.effects.shadow,
        className
      )}>
        <div className={combineClasses(
          'flex items-center mb-4',
          themeClasses.spacing.gapSmall
        )}>
          <div className={combineClasses(
            themeClasses.icons.sm,
            themeClasses.patterns.skeleton,
            themeClasses.effects.rounded
          )}></div>
          <div className={combineClasses(
            'h-5 w-32',
            themeClasses.patterns.skeleton,
            themeClasses.effects.rounded
          )}></div>
        </div>
        <div className={themeClasses.spacing.stackSmall}>
          {[...Array(3)].map((_, i) => (
            <PopularPostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!popularPosts || popularPosts.length === 0) {
    return (
      <div className={combineClasses(
        themeClasses.interactive.cardBase,
        themeClasses.spacing.card,
        themeClasses.effects.shadow,
        className
      )}>
        <div className={combineClasses(
          'flex items-center mb-4',
          themeClasses.spacing.gapSmall
        )}>
        </div>
        <p className={combineClasses(
          themeClasses.typography.bodySmall,
          themeClasses.text.secondary
        )}>
          Hiện tại chưa có bài viết phổ biến nào.
        </p>
      </div>
    );
  }

  return (
    <div className={combineClasses(
      themeClasses.interactive.cardBase,
      themeClasses.spacing.card,
      themeClasses.effects.shadow,
      className
    )}>
      {/* Posts List */}
      <div className={themeClasses.spacing.stackTiny}>
        {displayPosts && displayPosts.length > 0 ? (
          displayPosts.slice(0, limit).map((post, index) => (
            <PopularPostItem 
              key={post.id}
              post={post} 
              rank={index + 1}
              showImages={showImages}
            />
          ))
        ) : (
          <div className={combineClasses(
            'text-center',
            themeClasses.spacing.section
          )}>
            <p className={combineClasses(
              themeClasses.typography.bodySmall,
              themeClasses.text.muted
            )}>
              Không có bài viết phổ biến
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

// Loading skeleton component
const PopularPostSkeleton = () => (
  <div className={combineClasses(
    'flex items-start',
    themeClasses.spacing.gapSmall,
    themeClasses.animations.skeleton
  )}>
    <div className={combineClasses(
      'w-6 h-6',
      themeClasses.patterns.skeleton,
      themeClasses.effects.rounded
    )}></div>
    <div className={combineClasses(
      'w-16 h-12',
      themeClasses.patterns.skeleton,
      themeClasses.effects.rounded
    )}></div>
    <div className={combineClasses('flex-1', themeClasses.spacing.stackSmall)}>
      <div className={combineClasses(
        'h-4 w-3/4',
        themeClasses.patterns.skeleton,
        themeClasses.effects.rounded
      )}></div>
      <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
        <div className={combineClasses(
          'h-3 w-12',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
        <div className={combineClasses(
          'h-3 w-12',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
        <div className={combineClasses(
          'h-3 w-12',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
      </div>
    </div>
  </div>
);

export default PopularPosts;