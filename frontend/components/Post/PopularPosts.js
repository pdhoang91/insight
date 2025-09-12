// components/Post/PopularPosts.js
import React from 'react';
import Link from 'next/link';
import { FaFire, FaEye, FaComment, FaClock, FaHeart } from 'react-icons/fa';
import { usePopularPosts, useRecentPosts } from '../../hooks/useRecentPosts';
import { themeClasses, combineClasses } from '../../utils/themeClasses';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

// Individual Popular Post Item
const PopularPostItem = ({ post, rank, showImages, readingTime }) => {
  return (
    <article className="group">
      <Link href={`/p/${post.title_name}`} className={themeClasses.interactive.base}>
        <div className={combineClasses('flex items-start', themeClasses.spacing.gapSmall)}>
          {/* Rank Number */}
          <div className={combineClasses(
            'flex-shrink-0 w-6 h-6 flex items-center justify-center'
          )}>
            <span className={combineClasses(
              themeClasses.typography.labelSmall,
              themeClasses.typography.weightBold,
              rank <= 3 ? themeClasses.text.accent : themeClasses.text.muted
            )}>
              {rank}
            </span>
          </div>

          {/* Post Image */}
          {showImages && post.featured_image && (
            <div className={combineClasses(
              'flex-shrink-0 w-16 h-12 overflow-hidden',
              themeClasses.effects.rounded
            )}>
              <SafeImage
                src={post.featured_image}
                alt={post.title}
                className={combineClasses(
                  'w-full h-full object-cover',
                  'group-hover:scale-105',
                  themeClasses.animations.smooth
                )}
              />
            </div>
          )}

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            <h4 className={combineClasses(
              themeClasses.typography.bodySmall,
              themeClasses.typography.weightMedium,
              themeClasses.text.primary,
              'group-hover:' + themeClasses.text.accent.replace('text-', ''),
              themeClasses.animations.smooth,
              'leading-snug mb-1 line-clamp-2'
            )}>
              {post.title}
            </h4>
            
            <div className={combineClasses(
              'flex items-center',
              themeClasses.spacing.gapSmall,
              themeClasses.typography.bodyTiny,
              themeClasses.text.muted
            )}>
              {/* Reading Time */}
              <div className="flex items-center space-x-1">
                <FaClock className={themeClasses.icons.xs} />
                <span>{readingTime} min read</span>
              </div>

              {/* Views */}
              {post.view_count > 0 && (
                <div className="flex items-center space-x-1">
                  <FaEye className={themeClasses.icons.xs} />
                  <span>{post.view_count}</span>
                </div>
              )}

              {/* Claps */}
              {post.clap_count > 0 && (
                <div className="flex items-center space-x-1">
                  <FaHeart className={themeClasses.icons.xs} />
                  <span>{post.clap_count}</span>
                </div>
              )}

              {/* Comments */}
              {post.comment_count > 0 && (
                <div className="flex items-center space-x-1">
                  <FaComment className={themeClasses.icons.xs} />
                  <span>{post.comment_count}</span>
                </div>
              )}
            </div>
          </div>
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

  const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return 'Popular';
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
          <FaFire className={combineClasses(themeClasses.icons.sm, themeClasses.text.accent)} />
          <h3 className={combineClasses(
            themeClasses.typography.h5,
            themeClasses.typography.serif,
            themeClasses.typography.weightBold,
            themeClasses.text.primary
          )}>
            Popular Posts
          </h3>
        </div>
        <p className={combineClasses(
          themeClasses.typography.bodySmall,
          themeClasses.text.secondary
        )}>
          No popular posts available at the moment.
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
      {/* Header */}
      <div className={combineClasses(
        'flex items-center justify-between mb-4'
      )}>
        <div className={combineClasses(
          'flex items-center',
          themeClasses.spacing.gapSmall
        )}>
          <FaFire className={combineClasses(themeClasses.icons.sm, themeClasses.text.accent)} />
          <h3 className={combineClasses(
            themeClasses.typography.h5,
            themeClasses.typography.serif,
            themeClasses.typography.weightBold,
            themeClasses.text.primary
          )}>
            Popular Posts
          </h3>
        </div>
        <span className={combineClasses(
          themeClasses.typography.bodyTiny,
          themeClasses.text.muted,
          themeClasses.patterns.tag,
          themeClasses.effects.rounded
        )}>
          {getTimeframeLabel()}
        </span>
      </div>

      {/* Posts List */}
      <div className={themeClasses.spacing.stackSmall}>
        {displayPosts && displayPosts.length > 0 ? (
          displayPosts.slice(0, limit).map((post, index) => (
            <PopularPostItem 
              key={post.id} 
              post={post} 
              rank={index + 1}
              showImages={showImages}
              readingTime={calculateReadingTime(post.content || post.preview_content)}
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
              No popular posts available
            </p>
          </div>
        )}
      </div>

      {/* View All Link */}
      <div className={combineClasses(
        'mt-4 pt-4',
        themeClasses.border.primary,
        'border-t'
      )}>
        <Link
          href="/popular"
          className={combineClasses(
            themeClasses.typography.bodySmall,
            themeClasses.interactive.link,
            themeClasses.interactive.linkUnderline
          )}
        >
          View all popular posts →
        </Link>
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