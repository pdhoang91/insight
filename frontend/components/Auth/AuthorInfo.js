// components/AuthorInfo.js
import React from 'react';
import Link from 'next/link';
import FollowButton from '../Utils/FollowButton';

const AuthorInfo = ({ author }) => {
  return (
    <div className="flex items-center">
      <Link href={`/${author?.username}`} legacyBehavior>
        <a className="flex items-center">
          <img
            src={author?.avatar_url || '/default-avatar.png'}
            alt={`${author?.name || 'Author'} Avatar`}
            className="w-5 h-5 rounded-full mr-2"
          />
          <span className="text-sm sohne text-gray-700">
            {author?.name || 'Unknown Author'}
          </span>
        </a>
      </Link>
      {/* <FollowButton authorId={author.id} /> */}
    </div>
  );
};

export default AuthorInfo;

