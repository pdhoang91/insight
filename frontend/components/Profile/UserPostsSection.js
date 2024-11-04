// components/Profile/UserPostList.js
import React from 'react';
//import UserPostItem from './UserPostItem';
import PostItem from '../Post/PostItem';


const UserPostList = ({ posts }) => {
  if (!Array.isArray(posts)) {
    return <div>No posts available.</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default UserPostList;
