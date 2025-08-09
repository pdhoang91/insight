// components/Explore/FollowList.js
import React from 'react';
import FollowButton from '../Utils/FollowButton';

const FollowList = ({ 
  items = [], 
  type = 'users', 
  loading = false, 
  error = null,
  onItemClick = () => {},
  className = '' 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading {type}: {error}</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No {type} found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <div 
          key={item.id || index} 
          className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
        >
          <div 
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={() => onItemClick(item)}
          >
            {item.avatar && (
              <img 
                src={item.avatar} 
                alt={item.name || item.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-medium text-gray-900">
                {item.name || item.username || item.title}
              </h3>
              {item.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">{item.bio}</p>
              )}
              {item.followers_count !== undefined && (
                <p className="text-xs text-gray-500">
                  {item.followers_count} followers
                </p>
              )}
            </div>
          </div>
          
          {type === 'users' && (
            <FollowButton 
              userId={item.id}
              isFollowing={item.is_following}
              className="ml-4"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowList; 