// components/Article/RelatedArticles.js
import React from 'react';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const RelatedArticles = ({ currentPostId, categories = [], tags = [], limit = 3 }) => {
  // For now, we'll use recent posts. In a real implementation, 
  // this would be a more sophisticated recommendation algorithm
  const { posts: relatedPosts, isLoading } = useRecentPosts(limit + 1);

  // Filter out current post and limit results
  const filteredPosts = relatedPosts?.filter(post => post.id !== currentPostId).slice(0, limit) || [];

  if (isLoading) {
    return (
      <div className={combineClasses(
        themeClasses.layout.reading,
        'py-12'
      )}>
        <div className={themeClasses.spacing.stackLarge}>
          <div className={combineClasses(
            'h-6 w-48 animate-pulse',
            themeClasses.patterns.skeleton,
            themeClasses.effects.rounded
          )}></div>
          <div className={combineClasses(
            'grid md:grid-cols-2 lg:grid-cols-3',
            themeClasses.spacing.gapLarge
          )}>
            {[...Array(3)].map((_, i) => (
              <RelatedArticleSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!filteredPosts.length) {
    return null;
  }

  return (
    <div className={combineClasses(
      themeClasses.layout.reading,
      'py-12'
    )}>
      {/* Section Header */}
      <div className={themeClasses.spacing.marginBottomLarge}>
        <h2 className={combineClasses(
          themeClasses.typography.h2,
          themeClasses.typography.weightBold,
          themeClasses.text.primary,
          'mb-2'
        )}>
          More from Insight
        </h2>
        <div className={combineClasses(
          'w-16 h-0.5',
          'bg-medium-accent-green'
        )}></div>
      </div>

      {/* Articles Grid */}
      <div className={combineClasses(
        'grid md:grid-cols-2 lg:grid-cols-3',
        themeClasses.spacing.gapLarge
      )}>
        {filteredPosts.map((post) => (
          <RelatedArticleCard key={post.id} post={post} />
        ))}
      </div>

      {/* View All Link */}
      <div className={combineClasses(
        'text-center',
        themeClasses.spacing.marginTopXLarge
      )}>
        <Link
          href="/"
          className={combineClasses(
            'inline-flex items-center px-6 py-3 border rounded-full',
            'border-medium-accent-green text-medium-accent-green',
            'hover:bg-medium-accent-green hover:text-white',
            themeClasses.typography.weightMedium,
            themeClasses.animations.smooth
          )}
        >
          View all articles
        </Link>
      </div>
    </div>
  );
};

// Individual Related Article Card
const RelatedArticleCard = ({ post }) => {

  return (
    <article className={combineClasses('group cursor-pointer')}>
      <Link href={`/p/${post.slug}`} className="block">
        {/* Featured Image */}
        {post.cover_image && (
          <div className={combineClasses(
            themeClasses.spacing.marginBottomMedium,
            themeClasses.utils.overflowHidden,
            themeClasses.effects.rounded
          )}>
            <SafeImage
              src={post.cover_image}
              alt={post.title}
              width={300}
              height={200}
              className={combineClasses(
                'w-full h-48 object-cover group-hover:scale-105',
                'transition-transform duration-300'
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Article Info */}
        <div className={themeClasses.spacing.stackSmall}>
          {/* Author & Date */}
          <div className={combineClasses(
            'flex items-center',
            themeClasses.spacing.gapSmall,
            themeClasses.text.bodySmall,
            themeClasses.text.muted
          )}>
            <div className={combineClasses(
              'flex items-center',
              themeClasses.spacing.gapSmall
            )}>
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  className={combineClasses(
                    'w-5 h-5 rounded-full object-cover'
                  )}
                />
              ) : (
                <div className={combineClasses(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  'bg-medium-accent-green'
                )}>
                  <FaUser className={combineClasses(
                    'w-2.5 h-2.5 text-white'
                  )} />
                </div>
              )}
              <span>{post.user?.name || 'Anonymous'}</span>
            </div>
            <span>·</span>
            <TimeAgo timestamp={post.created_at} />
          </div>

          {/* Title */}
          <h3 className={combineClasses(
            themeClasses.typography.h4,
            themeClasses.typography.weightBold,
            themeClasses.text.primary,
            'group-hover:text-medium-accent-green',
            themeClasses.animations.smooth,
            'leading-tight'
          )}>
            {post.title}
          </h3>

          {/* Preview */}
          {post.excerpt && (
            <p className={combineClasses(
              themeClasses.text.secondary,
              themeClasses.text.bodySmall,
              'leading-relaxed line-clamp-2'
            )}>
              {post.excerpt.replace(/<[^>]*>/g, '').substring(0, 120)}
              {post.excerpt.length > 120 && '...'}
            </p>
          )}

          {/* Meta Info */}
          <div className={combineClasses(
            'flex items-center justify-between',
            themeClasses.text.xs,
            themeClasses.text.muted
          )}>
            {/* Category */}
            {post.categories && post.categories.length > 0 && (
              <span className={combineClasses(
                'px-2 py-1 rounded-full',
                themeClasses.patterns.tag
              )}>
                {post.categories[0].name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

// Skeleton Loader for Related Articles
const RelatedArticleSkeleton = () => (
  <div className={combineClasses(
    'animate-pulse',
    themeClasses.spacing.stackMedium
  )}>
    <div className={combineClasses(
      'h-48',
      themeClasses.patterns.skeleton,
      themeClasses.effects.rounded
    )}></div>
    <div className={themeClasses.spacing.stackSmall}>
      <div className={combineClasses(
        'flex items-center',
        themeClasses.spacing.gapSmall
      )}>
        <div className={combineClasses(
          'w-5 h-5 rounded-full',
          themeClasses.patterns.skeleton
        )}></div>
        <div className={combineClasses(
          'h-3 w-20',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
        <div className={combineClasses(
          'h-3 w-16',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
      </div>
      <div className={combineClasses(
        'h-5',
        themeClasses.patterns.skeleton,
        themeClasses.effects.rounded
      )}></div>
      <div className={themeClasses.spacing.stackTiny}>
        <div className={combineClasses(
          'h-3',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
        <div className={combineClasses(
          'h-3 w-3/4',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
      </div>
      <div className="flex justify-between">
        <div className={combineClasses(
          'h-3 w-16',
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

export default RelatedArticles;
