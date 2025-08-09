// components/Post/PostItemSmallWithImage.js
import React from 'react';
import Link from 'next/link';
import TextUtils from '../Utils/TextUtils';
import AuthorInfo from '../Auth/AuthorInfo';
import TimeAgo from '../Utils/TimeAgo';
import { motion } from 'framer-motion'; // Thêm Framer Motion cho animation

const PostItemSmallWithImage = ({ post }) => {
  if (!post) {
    return <div className="text-center text-gray-500">Đang tải bài viết...</div>;
  }

  return (
    <motion.div
      className="flex flex-col md:flex-row items-start space-x-0 md:space-x-4 mb-6 p-4 rounded-lg shadow-sm bg-white cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
    >
      {/* Content */}
      <div className="md:w-2/3 pr-0 md:pr-4 flex flex-col">
        <AuthorInfo author={post.user} />
        <Link href={`/p/${post.title_name}`} legacyBehavior>
          <a className="text-lg font-semibold text-gray-800 hover:underline mt-2">
            {post.title}
          </a>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-2 mt-2">
          <TextUtils html={post.preview_content} maxLength={100} />
        </p>
        <TimeAgo timestamp={post.created_at} className="mt-2 text-gray-500 text-xs" />
      </div>

      {/* Image Section */}
      {post.image_title && (
        <div className="md:w-1/3 mt-4 md:mt-0">
          <Link href={`/p/${post.title_name}`} legacyBehavior>
            <a>
              <motion.img
                src={post.image_title}
                alt={post.title}
                className="h-32 md:h-48 w-full object-cover rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </a>
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default PostItemSmallWithImage;
