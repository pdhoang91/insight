// components/Post/EngagementActions.js - Fully theme-based design
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaComment, FaEllipsisH, FaFlag, FaCopy } from 'react-icons/fa';
import { FaHandsClapping } from "react-icons/fa6";
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { themeClasses, combineClasses } from '../../utils/themeClasses';
import { useTranslations } from 'next-intl';

const EngagementActions = ({
  post,
  commentsCount = 0,
  layout = 'horizontal', // 'horizontal' | 'vertical'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabels = false,
  className = ''
}) => {
  const t = useTranslations();
  const { user } = useUser();
  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
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

  const handleClap = async () => {
    if (!user) {
      // TODO: Show login modal
      alert(t('engagement.loginToClap'));
      return;
    }
    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      mutateClaps();
    }
  };

  const handleMoreOptions = () => {
    setMoreMenuOpen(!isMoreMenuOpen);
  };

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
        {/* Clap Button */}
        <button
          onClick={handleClap}
          className={combineClasses(buttonClasses, 'group/clap')}
          aria-label={t('engagement.clap')}
          disabled={clapsLoading}
        >
          <FaHandsClapping className={combineClasses(
            iconSizes[size], 
            'group-hover/clap:scale-110',
            themeClasses.animations.smooth
          )} />
          <span className={sizeClasses[size]}>{clapsCount}</span>
          {showLabels && <span className={sizeClasses[size]}>{t('engagement.clap')}</span>}
        </button>

        {/* Comment Button */}
        <Link
          href={`/p/${post.slug}#comments`}
          className={buttonClasses}
          aria-label={t('engagement.comment')}
        >
          <FaComment className={iconSizes[size]} />
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
            onClick={handleMoreOptions}
            className={buttonClasses}
            aria-label={t('engagement.reportStory')}
          >
            <FaEllipsisH className={iconSizes[size]} />
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

// More options dropdown menu
const MoreOptionsMenu = ({ post, onClose, t }) => {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/p/${post.slug}`;
    navigator.clipboard.writeText(url);
    onClose();
    // TODO: Show toast notification
  };

  const handleReport = () => {
    // TODO: Implement report functionality
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
          <FaCopy className={combineClasses(themeClasses.icons.sm, 'mr-3')} />
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
          <FaFlag className={combineClasses(themeClasses.icons.sm, 'mr-3')} />
          {t('engagement.reportStory')}
        </button>
      </div>
    </div>
  );
};

// Floating engagement actions for article pages
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
