// components/Profile/UserPostList.js
import React from 'react';
import PostItemProfile from '../Post/PostItemProfile';

const UserPostList = ({ posts, isOwner }) => {
  if (!Array.isArray(posts)) {
    return <div>No posts available.</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItemProfile key={post.id} post={post} isOwner={isOwner} />
      ))}
    </div>
  );
};

export default UserPostList;
