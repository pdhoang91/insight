// components/UI/ThemeToggle.js
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const ThemeToggle = ({ variant = 'simple', className = '' }) => {
  const { theme, isDark, isLight, toggleTheme, setLightTheme, setDarkTheme, mounted } = useTheme();

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={combineClasses(
        'animate-pulse',
        className
      )}>
        <div className={combineClasses(
          'w-8 h-8',
          themeClasses.border.primary,
          themeClasses.effects.rounded
        )}></div>
      </div>
    );
  }

  if (variant === 'simple') {
    return (
      <button
        onClick={toggleTheme}
        className={combineClasses(
          'flex items-center p-2',
          themeClasses.spacing.gapSmall,
          themeClasses.effects.rounded,
          'hover:bg-medium-hover',
          themeClasses.animations.smooth,
          className
        )}
        aria-label={`Chuyển sang chế độ ${isDark ? 'sáng' : 'tối'}`}
        title={`Chuyển sang chế độ ${isDark ? 'sáng' : 'tối'}`}
      >
        {isDark ? (
          <>
            <FaSun className={combineClasses(
              themeClasses.icons.sm,
              themeClasses.text.accent
            )} />
            {className?.includes('justify-start') && (
              <span className={combineClasses(
                themeClasses.text.bodySmall,
                themeClasses.text.secondary
              )}>Chế độ sáng</span>
            )}
          </>
        ) : (
          <>
            <FaMoon className={combineClasses(
              themeClasses.icons.sm,
              themeClasses.text.accent
            )} />
            {className?.includes('justify-start') && (
              <span className={combineClasses(
                themeClasses.text.bodySmall,
                themeClasses.text.secondary
              )}>Chế độ tối</span>
            )}
          </>
        )}
      </button>
    );
  }

  if (variant === 'toggle') {
    return (
      <div className={combineClasses(
        'flex items-center',
        themeClasses.spacing.gapSmall,
        className
      )}>
        <FaSun className={combineClasses(
          themeClasses.icons.sm,
          themeClasses.animations.smooth,
          isLight ? themeClasses.text.accent : themeClasses.text.muted
        )} />
        <button
          onClick={toggleTheme}
          className={combineClasses(
            'relative inline-flex h-6 w-11 items-center rounded-full',
            themeClasses.animations.smooth,
            themeClasses.focus.ring,
            isDark ? themeClasses.bg.accent : themeClasses.bg.secondary
          )}
          aria-label={`Chuyển sang chế độ ${isDark ? 'sáng' : 'tối'}`}
        >
          <span
            className={combineClasses(
              'inline-block h-4 w-4 transform rounded-full',
              themeClasses.bg.card,
              themeClasses.animations.smooth,
              isDark ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <FaMoon className={combineClasses(
          themeClasses.icons.sm,
          themeClasses.animations.smooth,
          isDark ? themeClasses.text.accent : themeClasses.text.muted
        )} />
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={combineClasses(
      themeClasses.spacing.stackTiny,
      className
    )}>
      <div className={combineClasses(
        themeClasses.text.bodySmall,
        themeClasses.typography.weightMedium,
        themeClasses.text.secondary,
        'mb-2'
      )}>
        Giao diện
      </div>
      
      <button
        onClick={setLightTheme}
        className={combineClasses(
          'w-full flex items-center px-3 py-2',
          themeClasses.text.bodySmall,
          themeClasses.effects.rounded,
          themeClasses.animations.smooth,
          isLight
            ? combineClasses(themeClasses.bg.accent, 'text-white')
            : combineClasses(themeClasses.text.secondary, 'hover:bg-medium-hover')
        )}
      >
        <FaSun className={combineClasses(
          themeClasses.icons.sm,
          'mr-3'
        )} />
        Chế độ sáng
      </button>
      
      <button
        onClick={setDarkTheme}
        className={combineClasses(
          'w-full flex items-center px-3 py-2',
          themeClasses.text.bodySmall,
          themeClasses.effects.rounded,
          themeClasses.animations.smooth,
          isDark
            ? combineClasses(themeClasses.bg.accent, 'text-white')
            : combineClasses(themeClasses.text.secondary, 'hover:bg-medium-hover')
        )}
      >
        <FaMoon className={combineClasses(
          themeClasses.icons.sm,
          'mr-3'
        )} />
        Chế độ tối
      </button>
    </div>
  );
};

export default ThemeToggle;
