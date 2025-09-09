// components/Auth/AuthorInfo.js
import React from 'react';
import Link from 'next/link';

const AuthorInfo = ({ author }) => {
  return (
    <div className="flex items-center">
      <Link href={`/${author?.username}`} className="flex items-center">
        <img
          src={author?.avatar_url || '/author-avatar.svg'}
          alt={`${author?.name || 'Author'} Avatar`}
          className="w-5 h-5 rounded-full mr-2"
        />
        <span className="text-body-small text-medium-text-secondary hover:text-medium-accent-green transition-colors">
          {author?.name || 'Unknown Author'}
        </span>
      </Link>
    </div>
  );
};

export default AuthorInfo;