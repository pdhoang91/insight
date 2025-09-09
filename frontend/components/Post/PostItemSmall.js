// components/Post/PostItemSmall.js
import React from 'react';
import Link from 'next/link';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const PostItemSmall = ({ post }) => {
  if (!post) {
    return <div className="text-center text-medium-text-muted">Đang tải bài viết...</div>;
  }

  return (
    <motion.article
      className={`${componentClasses.card.hover} cursor-pointer mb-6`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className={`${themeClasses.responsive.flexTabletRow} items-start ${themeClasses.spacing.gap}`}>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/p/${post.title_name}`} className={`block ${themeClasses.spacing.marginBottomSmall}`}>
            <h3 className={`${componentClasses.heading.h4} ${themeClasses.interactive.link} line-clamp-2 text-balance`}>
              {post.title}
            </h3>
          </Link>
          <div className={`flex items-center ${componentClasses.text.bodyTiny} ${themeClasses.spacing.marginBottomSmall}`}>
            <TimeAgo timestamp={post.created_at} className="text-medium-text-muted" />
          </div>
          <p className={`${componentClasses.text.bodySmall} line-clamp-2 text-pretty`}>
            <TextUtils html={post.preview_content} maxLength={100} />
          </p>
        </div>
        
        {/* Arrow Icon for Navigation */}
        <div className="flex-shrink-0">
          <FaChevronRight className={`${themeClasses.icons.sm} text-medium-accent-blue`} />
        </div>
      </div>
    </motion.article>
  );
};

export default PostItemSmall;
