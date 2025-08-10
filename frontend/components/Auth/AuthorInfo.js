// components/AuthorInfo.js
import React from 'react';

const AuthorInfo = ({ author }) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        <img
          src={author?.avatar_url || '/default-avatar.png'}
          alt={`${author?.name || 'Author'} Avatar`}
          className="w-5 h-5 rounded-full mr-2"
        />
        <span className="text-sm font-medium text-gray-700">
          {author?.name || 'Unknown Author'}
        </span>
      </div>
    </div>
  );
};

export default AuthorInfo;

