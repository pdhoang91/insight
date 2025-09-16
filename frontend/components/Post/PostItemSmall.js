// components/Post/PostItemSmall.js
import React from 'react';
import Link from 'next/link';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import { FaChevronRight } from 'react-icons/fa';
import { themeClasses, componentClasses, combineClasses } from '../../utils/themeClasses';

const PostItemSmall = ({ post }) => {
  if (!post) {
    return (
      <div className={combineClasses(
        'text-center',
        themeClasses.text.muted
      )}>
        Đang tải bài viết...
      </div>
    );
  }

  return (
    <article className={combineClasses(
      themeClasses.bg.card,
      themeClasses.spacing.paddingBottomMedium,
      themeClasses.spacing.marginBottomLarge
    )}>
      <div className={combineClasses(
        themeClasses.responsive.flexTabletRow,
        'items-start',
        themeClasses.spacing.gap
      )}>
        {/* Content */}
        <div className={combineClasses(
          'flex-1 min-w-0 pb-3',
        )}>
          <Link 
            href={`/p/${post.title_name}`} 
            className={combineClasses(
              'block',
              themeClasses.spacing.marginBottomSmall
            )}
          >
            <h3 className={combineClasses(
              componentClasses.heading.h4,
              themeClasses.interactive.link,
              'line-clamp-2 text-balance'
            )}>
              {post.title}
            </h3>
          </Link>
          <div className={combineClasses(
            'flex items-center',
            componentClasses.text.bodyTiny,
            themeClasses.spacing.marginBottomSmall
          )}>
            <TimeAgo 
              timestamp={post.created_at} 
              className={themeClasses.text.muted} 
            />
          </div>
          <p className={combineClasses(
            componentClasses.text.bodySmall,
            'line-clamp-2 text-pretty'
          )}>
            <TextUtils html={post.preview_content} maxLength={100} />
          </p>
        </div>
        
        {/* Arrow Icon for Navigation */}
        <div className="flex-shrink-0">
          <FaChevronRight className={combineClasses(
            themeClasses.icons.sm,
            'text-medium-accent-blue'
          )} />
        </div>
      </div>
    </article>
  );
};

export default PostItemSmall;
