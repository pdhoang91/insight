// components/Reading/ReadingProgressWidget.js
import React from 'react';
import { FaEye } from 'react-icons/fa';
import { useThemeClasses } from '../../hooks/useThemeClasses';

// Reading Progress Widget
export const ReadingProgressWidget = ({ progress = 0, readingTime = 0 }) => {
  const { classes, combineClasses } = useThemeClasses();

  return (
    <div className={combineClasses(classes.card, 'p-4')}>
      <div className="flex items-center gap-3 mb-3">
        <FaEye className={`w-4 h-4 ${classes.text.accent}`} />
        <span className={combineClasses('text-sm font-medium', classes.text.primary)}>
          Tiến độ đọc
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={combineClasses('text-xs', classes.text.muted)}>
              Đã đọc
            </span>
            <span className={combineClasses('text-xs font-medium', classes.text.primary)}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className={combineClasses('w-full h-2 rounded-full', classes.bg.secondary)}>
            <div 
              className={combineClasses('h-full rounded-full transition-all duration-300', classes.bg.accent)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {readingTime > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <FaEye className={`w-3 h-3 ${classes.text.muted}`} />
            <span className={classes.text.muted}>
              {readingTime} phút đọc
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingProgressWidget;
