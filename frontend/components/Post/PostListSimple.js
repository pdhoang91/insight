// components/Post/PostListSimple.js
import React from 'react';
import PostItem from './PostItem';

const PostListSimple = ({ posts, isLoading, isError }) => {
  if (isLoading) {
    return <div className="text-center py-4">Đang tải bài viết...</div>;
  }

  if (isError) {
    return <div className="text-center py-4 text-red-500">Không thể tải bài viết</div>;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có bài viết</h3>
        <p className="text-gray-500">Chưa có bài viết nào được đăng. Hãy quay lại sau!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostListSimple;
