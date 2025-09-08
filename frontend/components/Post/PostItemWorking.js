// components/Post/PostItemWorking.js
import React from 'react';
import Link from 'next/link';

const PostItemWorking = ({ post }) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }

  return (
    <div className="border-b border-gray-200 py-6">
      <Link href={`/p/${post.title_name}`}>
        <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 mb-2">
          {post.title}
        </h2>
      </Link>
      
      {post.preview_content && (
        <p className="text-gray-600 mb-4">
          {post.preview_content.replace(/<[^>]*>/g, '').substring(0, 200)}
          {post.preview_content.length > 200 && '...'}
        </p>
      )}
      
      <div className="flex items-center text-sm text-gray-500">
        <span>{post.user?.name || 'Anonymous'}</span>
        <span className="mx-2">·</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
        <span className="mx-2">·</span>
        <span>{post.clap_count || 0} claps</span>
      </div>
    </div>
  );
};

export default PostItemWorking;
