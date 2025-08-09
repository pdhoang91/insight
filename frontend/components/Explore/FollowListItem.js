// components/Explore/FollowListItem.js
import React from 'react';
import FollowButton from '../Utils/FollowButton';
import { useRouter } from 'next/router';

const FollowListItem = ({ 
  user, 
  onFollow = () => {},
  className = '' 
}) => {
  const router = useRouter();

  const handleUserClick = () => {
    if (user.username) {
      router.push(`/${user.username}`);
    }
  };

  if (!user) return null;

  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow ${className}`}>
      <div 
        className="flex items-center space-x-3 cursor-pointer flex-1"
        onClick={handleUserClick}
      >
        <img 
          src={user.avatar || '/images/placeholder.svg'} 
          alt={user.name || user.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-gray-900">
            {user.name || user.username}
          </h3>
          {user.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
          )}
          {user.followers_count !== undefined && (
            <p className="text-xs text-gray-500">
              {user.followers_count} followers
            </p>
          )}
          {user.posts_count !== undefined && (
            <p className="text-xs text-gray-500">
              {user.posts_count} posts
            </p>
          )}
        </div>
      </div>
      
      <FollowButton 
        userId={user.id}
        isFollowing={user.is_following}
        onFollow={onFollow}
        className="ml-4"
      />
    </div>
  );
};

export default FollowListItem; 