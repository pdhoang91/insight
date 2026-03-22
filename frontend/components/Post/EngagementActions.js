// components/Post/EngagementActions.js - Fully theme-based design
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChatCircle, DotsThree, Flag, Copy } from '@phosphor-icons/react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';
import { useTranslations } from 'next-intl';

const EngagementActions = ({
  post,
  commentsCount = 0,
  layout = 'horizontal',
  size = 'md',
  showLabels = false,
  className = ''
}) => {
  const t = useTranslations();
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: themeClasses.typography.captionText,
    md: themeClasses.typography.bodySmall,
    lg: themeClasses.typography.bodyMedium
  };

  const iconSizes = {
    sm: themeClasses.icons.xs,
    md: themeClasses.icons.sm,
    lg: themeClasses.icons.md
  };

  const buttonClasses = combineClasses(
    'flex items-center',
    themeClasses.spacing.gapSmall,
    themeClasses.text.muted,
    themeClasses.text.accentHover,
    themeClasses.animations.smooth,
    'p-2',
    themeClasses.effects.rounded,
    'hover:bg-medium-hover'
  );

  const layoutClasses = layout === 'vertical'
    ? combineClasses('flex flex-col', themeClasses.spacing.stackSmall)
    : 'flex items-center justify-between';

  return (
    <div className={combineClasses(layoutClasses, className)}>
      {/* Left side actions */}
      <div className={layout === 'vertical'
        ? themeClasses.spacing.stackSmall
        : combineClasses('flex items-center', themeClasses.spacing.gapLarge)
      }>
        {/* Comment Button */}
        <Link
          href={`/p/${post.slug}#comments`}
          className={buttonClasses}
          aria-label={t('engagement.comment')}
        >
          <ChatCircle className={iconSizes[size]} />
          <span className={sizeClasses[size]}>{commentsCount}</span>
          {showLabels && <span className={sizeClasses[size]}>{t('engagement.comment')}</span>}
        </Link>
      </div>

      {/* Right side actions */}
      <div className={layout === 'vertical'
        ? themeClasses.spacing.stackSmall
        : combineClasses('flex items-center', themeClasses.spacing.gap)
      }>
        {/* More Options */}
        <div ref={moreMenuRef} className={themeClasses.utils.relative}>
          <button
            onClick={() => setMoreMenuOpen(!isMoreMenuOpen)}
            className={buttonClasses}
            aria-label={t('engagement.reportStory')}
          >
            <DotsThree className={iconSizes[size]} />
          </button>

          {isMoreMenuOpen && (
            <MoreOptionsMenu
              post={post}
              onClose={() => setMoreMenuOpen(false)}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const MoreOptionsMenu = ({ post, onClose, t }) => {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/p/${post.slug}`;
    navigator.clipboard.writeText(url);
    onClose();
  };

  const handleReport = () => {
    onClose();
  };

  return (
    <div className={combineClasses(
      themeClasses.utils.absolute,
      'right-0 mt-2 w-48 overflow-hidden z-50',
      themeClasses.bg.card,
      themeClasses.effects.shadowLayeredMd,
      themeClasses.effects.rounded
    )}>
      <div className="py-2">
        <button
          onClick={handleCopyLink}
          className={combineClasses(
            'w-full flex items-center px-4 py-2',
            themeClasses.text.bodySmall,
            themeClasses.text.secondary,
            'hover:bg-medium-hover',
            themeClasses.text.accentHover,
            themeClasses.animations.smooth
          )}
        >
          <Copy className={combineClasses(themeClasses.icons.sm, 'mr-3')} />
          {t('engagement.copyLink')}
        </button>

        <button
          onClick={handleReport}
          className={combineClasses(
            'w-full flex items-center px-4 py-2',
            themeClasses.text.bodySmall,
            themeClasses.text.secondary,
            'hover:bg-medium-hover',
            themeClasses.text.accentHover,
            themeClasses.animations.smooth
          )}
        >
          <Flag className={combineClasses(themeClasses.icons.sm, 'mr-3')} />
          {t('engagement.reportStory')}
        </button>
      </div>
    </div>
  );
};

export const FloatingEngagementActions = ({ post, commentsCount, className = '' }) => {
  return (
    <div className={combineClasses(
      'fixed left-6 top-1/2 transform -translate-y-1/2 z-40',
      className
    )}>
      <div className={combineClasses(
        themeClasses.bg.card,
        themeClasses.effects.rounded,
        themeClasses.effects.shadowLayeredMd,
        'p-2'
      )}>
        <EngagementActions
          post={post}
          commentsCount={commentsCount}
          layout="vertical"
          size="lg"
        />
      </div>
    </div>
  );
};

export default EngagementActions;
