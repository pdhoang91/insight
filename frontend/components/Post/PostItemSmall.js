// components/Post/PostItemSmall.js
import React from 'react';
import Link from 'next/link';
import TextUtils from '../Utils/TextUtils';
import AuthorInfo from '../Auth/AuthorInfo';
import TimeAgo from '../Utils/TimeAgo';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';

const PostItemSmall = ({ post }) => {
  if (!post) {
    return <div className="text-center text-medium-text-muted">Đang tải bài viết...</div>;
  }

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 mb-6 p-6 rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200 bg-medium-bg-card cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Content */}
      <div className="flex-1">
        <AuthorInfo author={post.user} />
        <Link href={`/p/${post.title_name}`}>
          <h5 className="text-heading-3 text-medium-text-primary hover:text-medium-accent-green transition-colors duration-200 line-clamp-2">
            {post.title}
          </h5>
        </Link>
        {/* <div className="flex items-center text-gray-500 text-sm my-2">
          <TimeAgo timestamp={post.created_at} />
        </div> */}
        <p className="text-medium-text-secondary text-body-small line-clamp-2">
          <TextUtils html={post.preview_content} maxLength={100} />
        </p>
      </div>
      
      {/* Arrow Icon for Navigation */}
      <div className="mt-2 sm:mt-0 flex-shrink-0">
        <FaChevronRight className="text-medium-accent-blue" />
      </div>
    </motion.div>
  );
};

export default PostItemSmall;
