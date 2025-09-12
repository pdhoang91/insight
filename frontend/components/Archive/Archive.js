// components/Archive/Archive.js
import React, { useState } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const Archive = ({ posts = [], className = '', showAll = false }) => {
  const [expandedYears, setExpandedYears] = useState(new Set([new Date().getFullYear()]));
  const [isShowingAll, setIsShowingAll] = useState(showAll);

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
  const allYears = Object.keys(groupedPosts).sort((a, b) => b - a);
  
  // Limit to recent years if not showing all
  const years = isShowingAll ? allYears : allYears.slice(0, 2);

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
      <div className={className}>
        <p className="text-sm text-medium-text-muted">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Archive Content - Always Visible */}
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
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <FaChevronDown className="w-3 h-3 text-medium-text-muted group-hover:text-medium-accent-green" />
                        ) : (
                          <FaChevronRight className="w-3 h-3 text-medium-text-muted group-hover:text-medium-accent-green" />
                        )}
                        <span className="font-medium text-medium-text-primary group-hover:text-medium-accent-green">
                          {year}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full text-medium-text-muted">
                        {totalYearPosts}
                      </span>
                    </button>

                    {/* Months */}
                    {isExpanded && (
                      <div className="ml-6 space-y-1">
                        {Object.keys(yearPosts)
                          .sort((a, b) => b - a) // Sort months descending
                          .slice(0, isShowingAll ? undefined : 6) // Limit months if not showing all
                          .map(month => {
                            const monthInt = parseInt(month);
                            const monthPosts = yearPosts[month];
                            const monthName = monthNames[monthInt];

                            return (
                              <Link
                                key={month}
                                href={`/archive/${year}/${monthInt + 1}`}
                                className="flex items-center justify-between py-1 px-2 rounded hover:bg-medium-accent-green/5 transition-colors group"
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

        {/* Toggle View All / View Less */}
        {allYears.length > 2 && (
          <div className="mt-4 pt-2">
            {!isShowingAll ? (
              <button
                onClick={() => setIsShowingAll(true)}
                className="text-xs text-medium-accent-green hover:underline focus:outline-none"
              >
                Show all years ({allYears.length}) →
              </button>
            ) : (
              <button
                onClick={() => setIsShowingAll(false)}
                className="text-xs text-medium-accent-green hover:underline focus:outline-none"
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