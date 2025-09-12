// components/Shared/SkeletonLoader.js
import React from 'react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const SkeletonLoader = ({ 
  variant = 'default', 
  count = 1, 
  className = '',
  showImage = true,
  showMeta = true 
}) => {
  const renderSkeleton = (index) => {
    switch (variant) {
      case 'post':
        return (
          <div 
            key={index}
            className={combineClasses(
              themeClasses.interactive.cardBase,
              themeClasses.spacing.card,
              themeClasses.effects.shadow,
              themeClasses.animations.skeleton,
              className
            )}
          >
            <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
              {showImage && (
                <div className={combineClasses(
                  'w-16 h-16',
                  themeClasses.patterns.skeleton,
                  themeClasses.effects.rounded
                )} />
              )}
              <div className={combineClasses('flex-1', themeClasses.spacing.stackSmall)}>
                <div className={combineClasses(
                  'h-4 w-3/4',
                  themeClasses.patterns.skeleton,
                  themeClasses.effects.rounded
                )} />
                {showMeta && (
                  <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
                    <div className={combineClasses(
                      'h-3 w-16',
                      themeClasses.patterns.skeleton,
                      themeClasses.effects.rounded
                    )} />
                    <div className={combineClasses(
                      'h-3 w-12',
                      themeClasses.patterns.skeleton,
                      themeClasses.effects.rounded
                    )} />
                    <div className={combineClasses(
                      'h-3 w-14',
                      themeClasses.patterns.skeleton,
                      themeClasses.effects.rounded
                    )} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div 
            key={index}
            className={combineClasses(
              'flex items-center',
              themeClasses.spacing.gapSmall,
              themeClasses.animations.skeleton,
              className
            )}
          >
            {showImage && (
              <div className={combineClasses(
                'w-8 h-8',
                themeClasses.patterns.skeleton,
                themeClasses.effects.rounded
              )} />
            )}
            <div className={combineClasses(
              'h-4 flex-1',
              themeClasses.patterns.skeleton,
              themeClasses.effects.rounded
            )} />
          </div>
        );

      case 'card':
        return (
          <div 
            key={index}
            className={combineClasses(
              themeClasses.interactive.cardBase,
              themeClasses.spacing.card,
              themeClasses.effects.shadow,
              themeClasses.animations.skeleton,
              className
            )}
          >
            {showImage && (
              <div className={combineClasses(
                'w-full h-32 mb-4',
                themeClasses.patterns.skeleton,
                themeClasses.effects.rounded
              )} />
            )}
            <div className={themeClasses.spacing.stackSmall}>
              <div className={combineClasses(
                'h-5 w-4/5',
                themeClasses.patterns.skeleton,
                themeClasses.effects.rounded
              )} />
              <div className={combineClasses(
                'h-4 w-full',
                themeClasses.patterns.skeleton,
                themeClasses.effects.rounded
              )} />
              <div className={combineClasses(
                'h-4 w-3/4',
                themeClasses.patterns.skeleton,
                themeClasses.effects.rounded
              )} />
              {showMeta && (
                <div className={combineClasses('flex', themeClasses.spacing.gapSmall)}>
                  <div className={combineClasses(
                    'h-3 w-16',
                    themeClasses.patterns.skeleton,
                    themeClasses.effects.rounded
                  )} />
                  <div className={combineClasses(
                    'h-3 w-12',
                    themeClasses.patterns.skeleton,
                    themeClasses.effects.rounded
                  )} />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div 
            key={index}
            className={combineClasses(
              'h-4 w-full',
              themeClasses.patterns.skeleton,
              themeClasses.effects.rounded,
              themeClasses.animations.skeleton,
              className
            )}
          />
        );
    }
  };

  return (
    <div className={themeClasses.spacing.stackSmall}>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

export default SkeletonLoader;
