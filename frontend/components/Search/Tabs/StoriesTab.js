// components/Search/Tabs/StoriesTab.js
import React from 'react';
import PostItem from '../../Post/PostItem';

export const StoriesTab = ({ stories, query }) => {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No stories found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <PostItem key={story.id} post={story} />
      ))}
    </div>
  );
};

export default StoriesTab; 