// components/Auth/AuthorInfo.js
import React from 'react';
import Link from 'next/link';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

const AuthorInfo = ({ author }) => {
  return (
    <div className="flex items-center">
      <Link href={`/${author?.username}`} className="flex items-center">
        <img
          src={author?.avatar_url || '/author-avatar.svg'}
          alt={`${author?.name || 'Author'} Avatar`}
          className={combineClasses(
            'w-5 h-5 rounded-full mr-2'
          )}
        />
        <span className={combineClasses(
          themeClasses.text.bodySmall,
          themeClasses.text.secondary,
          themeClasses.text.accentHover,
          themeClasses.animations.smooth
        )}>
          {author?.name || 'Unknown Author'}
        </span>
      </Link>
    </div>
  );
};

export default AuthorInfo;