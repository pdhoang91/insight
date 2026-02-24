// components/Profile/UserPostList.js
import React from 'react';
import BasePostItem from '../Post/BasePostItem';

const UserPostList = ({ posts, isOwner }) => {
  if (!Array.isArray(posts)) {
    return <div>No posts available.</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <BasePostItem key={post.id} post={post} variant="profile" isOwner={isOwner} />
      ))}
    </div>
  );
};

export default UserPostList;
