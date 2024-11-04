// components/Post/PostItemSmallWithImage.js
import React from 'react';
import Link from 'next/link';
import TextUtils from '../Utils/TextUtils';
import AuthorInfo from '../Auth/AuthorInfo';
import TimeAgo from '../Utils/TimeAgo';

const PostItemSmallWithImage = ({ post }) => {
  if (!post) {
    return <div className="text-center text-gray-500">Đang tải bài viết...</div>;
  }
  
  return (
    <div className="flex flex-col md:flex-row items-start space-x-0 md:space-x-4 mb-6 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-white cursor-pointer">
      {/* Content */}
      <div className="md:w-2/3 pr-0 md:pr-4">
        <AuthorInfo author={post.user} />
        <Link href={`/p/${post.title_name}`} className="text-lg font-semibold text-gray-800 hover:underline">
          {post.title}
        </Link>
        <TimeAgo timestamp={post.created_at} />
        
        <p className="text-gray-600 text-sm line-clamp-2">
          <TextUtils html={post.preview_content} maxLength={100} />
        </p>
      </div>
      
      {/* Image Section */}
      {post.image_title && (
        <div className="md:w-1/3 mt-4 md:mt-0">
          <Link href={`/p/${post.title_name}`}>
            <img
              src={post.image_title}
              alt={post.title}
              className="h-32 md:h-48 w-full object-cover rounded transform hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostItemSmallWithImage;
