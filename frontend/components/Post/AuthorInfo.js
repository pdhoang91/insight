// components/Post/AuthorInfo.js - Medium 2024 Design
import React from 'react';
import Link from 'next/link';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import TimeAgo from '../Utils/TimeAgo';
import { themeClasses, combineClasses } from '../../utils/themeClasses';
import { useTranslations } from 'next-intl';

const AuthorInfo = ({
  author,
  publishedAt,
  variant = 'compact',
  showFollowButton = false,
  className = ''
}) => {
  const t = useTranslations();
  if (!author) {
    return <AuthorInfoSkeleton />;
  }

  if (variant === 'detailed') {
    return (
      <div className={combineClasses(
        'flex items-start',
        themeClasses.spacing.gapSmall,
        className
      )}>
        <Link href={`/${author.username}`}>
          <Avatar
            src={author.avatar_url}
            name={author.name}
            size="lg"
            className={combineClasses(
              'hover:ring-2 hover:ring-medium-accent-green/20',
              themeClasses.animations.smooth
            )}
          />
        </Link>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/${author.username}`}
              className={combineClasses(
                themeClasses.typography.weightMedium,
                themeClasses.text.primary,
                themeClasses.text.accentHover,
                themeClasses.animations.smooth
              )}
            >
              {author.name}
            </Link>
            {showFollowButton && (
              <Button variant="outline" size="sm">
                {t('post.follow')}
              </Button>
            )}
          </div>

          {author.bio && (
            <p className={combineClasses(
              themeClasses.text.bodySmall,
              themeClasses.text.secondary,
              'mb-3 line-clamp-2'
            )}>
              {author.bio}
            </p>
          )}

          <div className={combineClasses(
            'flex items-center',
            themeClasses.spacing.gapSmall,
            themeClasses.text.bodySmall,
            themeClasses.text.muted
          )}>
            {publishedAt && (
              <>
                <TimeAgo timestamp={publishedAt} />
                <span>•</span>
              </>
            )}
            <span>{author.followers_count || 0} {t('post.followers')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={combineClasses(
      'flex items-center',
      themeClasses.spacing.gapSmall,
      className
    )}>
      <Link href={`/${author.username}`}>
        <Avatar
          src={author.avatar_url}
          name={author.name}
          size="sm"
          className={combineClasses(
            'hover:ring-2 hover:ring-medium-accent-green/20',
            themeClasses.animations.smooth
          )}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Link
            href={`/${author.username}`}
            className={combineClasses(
              themeClasses.typography.weightMedium,
              themeClasses.text.primary,
              themeClasses.text.accentHover,
              themeClasses.animations.smooth,
              'truncate'
            )}
          >
            {author.name}
          </Link>
          {showFollowButton && (
            <Button variant="ghost" size="sm" className="text-xs">
              {t('post.follow')}
            </Button>
          )}
        </div>

        <div className={combineClasses(
          'flex items-center',
          themeClasses.spacing.gapTiny,
          themeClasses.text.bodySmall,
          themeClasses.text.muted
        )}>
          {publishedAt && <TimeAgo timestamp={publishedAt} />}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton
const AuthorInfoSkeleton = ({ variant = 'compact' }) => {
  if (variant === 'detailed') {
    return (
      <div className={combineClasses(
        'flex items-start animate-pulse',
        themeClasses.spacing.gapSmall
      )}>
        <div className={combineClasses(
          'w-12 h-12 rounded-full',
          themeClasses.patterns.skeleton
        )}></div>
        <div className="flex-1">
          <div className={combineClasses(
            'h-4 w-32 mb-2',
            themeClasses.patterns.skeleton,
            themeClasses.effects.rounded
          )}></div>
          <div className={combineClasses(
            'h-3 w-48 mb-3',
            themeClasses.patterns.skeleton,
            themeClasses.effects.rounded
          )}></div>
          <div className={combineClasses(
            'h-3 w-24',
            themeClasses.patterns.skeleton,
            themeClasses.effects.rounded
          )}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={combineClasses(
      'flex items-center animate-pulse',
      themeClasses.spacing.gapSmall
    )}>
      <div className={combineClasses(
        'w-8 h-8 rounded-full',
        themeClasses.patterns.skeleton
      )}></div>
      <div className="flex-1">
        <div className={combineClasses(
          'h-4 w-24 mb-1',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
        <div className={combineClasses(
          'h-3 w-16',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
      </div>
    </div>
  );
};

export default AuthorInfo;
export { AuthorInfoSkeleton };
