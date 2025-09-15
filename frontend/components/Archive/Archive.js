// components/Archive/Archive.js - Fully theme-based design
import React, { useState } from 'react';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';
import { themeClasses, componentClasses, combineClasses } from '../../utils/themeClasses';

const Archive = ({ posts = [], className = '', limit = 12 }) => {
  const [isShowingAll, setIsShowingAll] = useState(false);

  // Group posts by month and year, then create a flat list
  const createArchiveList = (posts) => {
    const grouped = {};
    
    posts.forEach(post => {
      const date = new Date(post.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          posts: []
        };
      }
      
      grouped[key].posts.push(post);
    });
    
    // Convert to array and sort by date (newest first)
    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map(key => ({
        key,
        year: grouped[key].year,
        month: grouped[key].month,
        count: grouped[key].posts.length
      }));
  };

  const archiveList = createArchiveList(posts);
  const displayList = isShowingAll ? archiveList : archiveList.slice(0, limit);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!posts.length) {
    return (
      <div className={className}>
        <p className={combineClasses(
          themeClasses.typography.bodySmall,
          themeClasses.text.muted
        )}>No posts yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Archive List - Simple Month Year (count) format */}
      <div className={themeClasses.spacing.stackSmall}>
        {displayList.map(({ key, year, month, count }) => {
          const monthName = monthNames[month];
          
          return (
            <Link
              key={key}
              href={`/archive/${year}/${month + 1}`}
              className={combineClasses(
                'block py-1 px-2 group',
                themeClasses.effects.rounded,
                'hover:bg-medium-accent-green/5',
                themeClasses.animations.smooth
              )}
            >
              <span className={combineClasses(
                themeClasses.typography.bodySmall,
                themeClasses.text.secondary,
                'group-hover:text-medium-accent-green'
              )}>
                {monthName} {year} ({count})
              </span>
            </Link>
          );
        })}

        {/* Toggle Show All / Show Less */}
        {archiveList.length > limit && (
          <div className={combineClasses(
            themeClasses.spacing.marginTopMedium,
            'pt-2'
          )}>
            {!isShowingAll ? (
              <button
                onClick={() => setIsShowingAll(true)}
                className={combineClasses(
                  themeClasses.typography.captionText,
                  themeClasses.text.accent,
                  'hover:underline',
                  themeClasses.focus.visible,
                  themeClasses.interactive.touchTarget,
                  themeClasses.animations.smooth
                )}
              >
                Show all ({archiveList.length}) →
              </button>
            ) : (
              <button
                onClick={() => setIsShowingAll(false)}
                className={combineClasses(
                  themeClasses.typography.captionText,
                  themeClasses.text.accent,
                  'hover:underline',
                  themeClasses.focus.visible,
                  themeClasses.interactive.touchTarget,
                  themeClasses.animations.smooth
                )}
              >
                ← Show recent only
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;