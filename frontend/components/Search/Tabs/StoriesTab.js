// components/Search/Tabs/StoriesTab.js
import React from 'react';
import PostItemSmallWithImage from '../../Post/PostItemSmallWithImage';

export const StoriesTab = ({ stories, query }) => {
  if (!stories || stories.length === 0) {
    return <p className="text-gray-600">Không tìm thấy Stories phù hợp.</p>;
  }

  return (
    <div>
      {stories.map((story) => (
        <PostItemSmallWithImage key={story.id} post={story} />
      ))}
    </div>
  );
};

//export default StoriesTab;
