// components/Profile/UserPostList.js
import React from 'react';
//import UserPostItem from './UserPostItem';
import UserPostList from './UserPostList';


const UserPostsSection = ({ posts, isOwner }) => {
  if (!Array.isArray(posts)) {
    return <div>No posts available.</div>;
  }

  return (
      <div>
        <UserPostList posts={posts} isOwner={isOwner} />
      </div>
  );
};

export default UserPostsSection;
