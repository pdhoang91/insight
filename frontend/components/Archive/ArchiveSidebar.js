// components/Archive/ArchiveSidebar.js
import React from 'react';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';
import { useThemeClasses } from '../../hooks/useThemeClasses';

// Archive Component
export const ArchiveSidebar = ({ archives = [], isLoading = false }) => {
  const { classes, combineClasses } = useThemeClasses();

  if (isLoading) {
    return (
      <div className={combineClasses(classes.card, 'p-6')}>
        <h3 className={combineClasses(classes.heading.h3, 'mb-4')}>
          Lưu trữ
        </h3>
        <div className={classes.spacing?.stackSmall || 'space-y-2'}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={combineClasses(
              'h-4',
              classes.skeleton || classes.patterns?.skeleton || 'animate-pulse bg-gray-200',
              classes.effects?.rounded || 'rounded'
            )}></div>
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
      
      <div className={classes.spacing?.stackSmall || 'space-y-2'}>
        {archives.map((archive) => (
          <Link
            key={`${archive.year}-${archive.month}`}
            href={`/archive/${archive.year}/${archive.month}`}
            className={combineClasses(
              'flex items-center justify-between py-2 px-3 rounded-lg transition-colors',
              classes.text?.secondary || 'text-gray-700',
              classes.interactive?.linkHover || 'hover:text-green-600'
            )}
          >
            <span className={classes.typography?.bodySmall || 'text-sm'}>
              Tháng {archive.month}/{archive.year}
            </span>
            <span className={combineClasses(
              classes.typography?.bodyTiny || 'text-xs',
              classes.text?.muted || 'text-gray-500'
            )}>
              ({archive.count})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ArchiveSidebar;
