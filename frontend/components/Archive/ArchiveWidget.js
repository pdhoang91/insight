// components/Archive/ArchiveWidget.js
import React, { useState } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const ArchiveWidget = ({ posts = [], className = '' }) => {
  const [expandedYears, setExpandedYears] = useState(new Set([new Date().getFullYear()]));

  // Group posts by year and month
  const groupPostsByDate = (posts) => {
    const grouped = {};
    
    posts.forEach(post => {
      const date = new Date(post.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (!grouped[year]) {
        grouped[year] = {};
      }
      
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }
      
      grouped[year][month].push(post);
    });
    
    return grouped;
  };

  const groupedPosts = groupPostsByDate(posts);
  const years = Object.keys(groupedPosts).sort((a, b) => b - a);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const toggleYear = (year) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  if (!posts.length) {
    return (
      <div className={`bg-medium-bg-card rounded-lg p-6 border border-medium-border ${className}`}>
        <h3 className={`${componentClasses.heading.h3} mb-4 flex items-center`}>
          <FaCalendarAlt className={`${themeClasses.icons.sm} ${themeClasses.text.accent} mr-2`} />
          Archive
        </h3>
        <p className="text-medium-text-muted text-body-small">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className={`bg-medium-bg-card rounded-lg p-6 border border-medium-border ${className}`}>
      {/* Header */}
      <h3 className={`${componentClasses.heading.h3} mb-4 flex items-center`}>
        <FaCalendarAlt className={`${themeClasses.icons.sm} ${themeClasses.text.accent} mr-2`} />
        Archive
      </h3>

      {/* Archive Tree */}
      <div className="space-y-2">
        {years.map(year => {
          const yearInt = parseInt(year);
          const isExpanded = expandedYears.has(yearInt);
          const yearPosts = groupedPosts[year];
          const totalYearPosts = Object.values(yearPosts).reduce((sum, monthPosts) => sum + monthPosts.length, 0);

          return (
            <div key={year}>
              {/* Year Header */}
              <button
                onClick={() => toggleYear(yearInt)}
                className="w-full flex items-center justify-between py-2 text-left hover:text-medium-accent-green transition-colors group"
              >
                <div className="flex items-center gap-sm">
                  {isExpanded ? (
                    <FaChevronDown className={`${themeClasses.icons.xs} ${themeClasses.text.muted} group-hover:${themeClasses.text.accentHover}`} />
                  ) : (
                    <FaChevronRight className={`${themeClasses.icons.xs} ${themeClasses.text.muted} group-hover:${themeClasses.text.accentHover}`} />
                  )}
                  <span className="font-medium text-medium-text-primary group-hover:text-medium-accent-green">
                    {year}
                  </span>
                </div>
                <span className="text-xs bg-medium-bg-secondary px-2 py-1 rounded-full text-medium-text-muted">
                  {totalYearPosts}
                </span>
              </button>

              {/* Months */}
              {isExpanded && (
                <div className="ml-6 space-y-1">
                  {Object.keys(yearPosts)
                    .sort((a, b) => b - a) // Sort months descending
                    .map(month => {
                      const monthInt = parseInt(month);
                      const monthPosts = yearPosts[month];
                      const monthName = monthNames[monthInt];

                      return (
                        <Link
                          key={month}
                          href={`/archive/${year}/${monthInt + 1}`}
                          className="flex items-center justify-between py-1 px-2 rounded hover:bg-medium-bg-secondary transition-colors group"
                        >
                          <span className="text-sm text-medium-text-secondary group-hover:text-medium-accent-green">
                            {monthName}
                          </span>
                          <span className="text-xs text-medium-text-muted">
                            {monthPosts.length}
                          </span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-medium-divider">
        <Link
          href="/archive"
          className="text-sm text-medium-accent-green hover:underline"
        >
          View all archives →
        </Link>
      </div>
    </div>
  );
};

export default ArchiveWidget;
