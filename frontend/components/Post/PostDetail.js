// components/Post/PostDetail.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaShare, FaBookmark } from "react-icons/fa6";
import { FaEye, FaComment, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import TableOfContents from '../Shared/TableOfContents';
import SEOHead from '../SEO/SEOHead';
import RelatedPosts from './RelatedPosts';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

export const PostDetail = ({ post, relatedPosts = [], onScrollToComments }) => {
  if (!post) {
    return (
      <div className={combineClasses(
        'flex justify-center items-center h-64',
        themeClasses.text.muted
      )}>
        Đang tải bài viết...
      </div>
    );
  }

  const { clapsCount: postClapsCount, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { totalCommentReply } = useComments(post.id, true, 1, 10);

  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }

    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };


  return (
    <>
      <SEOHead
        title={post.title}
        description={post.preview_content || post.content?.substring(0, 160)}
        image={post.image_title}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        author={post.author?.name}
        category={post.category}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/p/${post.title_name}`}
      />
      <div className="">
      <div className={combineClasses(
        'grid grid-cols-1 lg:grid-cols-4',
        themeClasses.spacing.gapLarge
      )}>
        {/* Main Content */}
        <article className="lg:col-span-3">
          {/* Title Section */}
          <header className={themeClasses.spacing.marginBottomXLarge}>
            <h1 className={combineClasses(
              themeClasses.typography.h1,
              'lg:text-4xl xl:text-5xl',
              themeClasses.typography.weightBold,
              themeClasses.text.primary,
              themeClasses.spacing.marginBottomLarge,
              'leading-tight text-balance'
            )}>
              {post.title}
            </h1>

            {/* Post Meta Information */}
            <div className={combineClasses(
              'flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 border-y',
              themeClasses.spacing.gapMedium,
              themeClasses.border.primary
            )}>
              {/* Date and Reading Time */}
              <div className={combineClasses(
                'flex items-center',
                themeClasses.spacing.gapMedium,
                themeClasses.text.muted
              )}>
                <time 
                  dateTime={post.created_at} 
                  className={themeClasses.typography.weightMedium}
                >
                  {new Date(post.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <span className={combineClasses(
                  'w-1 h-1 rounded-full',
                  themeClasses.bg.muted
                )}></span>
                <span className={themeClasses.typography.weightMedium}>
                  {Math.ceil((post.content?.length || 0) / 1000)} min read
                </span>
              </div>

              {/* Social Actions */}
              <div className={combineClasses(
                'flex items-center',
                themeClasses.spacing.gapMedium
              )}>
                {/* Claps */}
                <button
                  onClick={handleClap}
                  className={combineClasses(
                    'flex items-center px-3 py-2 rounded-full min-h-[44px]',
                    themeClasses.spacing.gapSmall,
                    themeClasses.animations.smooth,
                    themeClasses.interactive.touchTarget,
                    hasClapped 
                      ? combineClasses(
                          'text-medium-accent-green bg-medium-accent-green/10'
                        )
                      : combineClasses(
                          themeClasses.text.secondary,
                          'hover:text-medium-accent-green hover:bg-medium-hover'
                        )
                  )}
                  aria-label="Thích bài viết này"
                >
                  <FaHandsClapping className={themeClasses.icons.sm} />
                  <span className={themeClasses.typography.weightMedium}>
                    {postClapsCount}
                  </span>
                </button>

                {/* Comments */}
                <button 
                  onClick={onScrollToComments}
                  className={combineClasses(
                    'flex items-center px-3 py-2 rounded-full min-h-[44px]',
                    themeClasses.spacing.gapSmall,
                    themeClasses.text.secondary,
                    'hover:text-medium-accent-green hover:bg-medium-hover',
                    themeClasses.animations.smooth,
                    themeClasses.interactive.touchTarget
                  )}
                  aria-label="Đi tới bình luận"
                >
                  <FaComment className={themeClasses.icons.sm} />
                  <span className={themeClasses.typography.weightMedium}>
                    {totalCommentReply || 0}
                  </span>
                </button>

                {/* Share Button */}
                <button 
                  className={combineClasses(
                    'flex items-center px-3 py-2 rounded-full min-h-[44px]',
                    themeClasses.spacing.gapSmall,
                    themeClasses.text.secondary,
                    'hover:text-medium-accent-green hover:bg-medium-hover',
                    themeClasses.animations.smooth,
                    themeClasses.interactive.touchTarget
                  )}
                  aria-label="Chia sẻ bài viết này"
                >
                  <FaShare className={themeClasses.icons.sm} />
                </button>

                {/* Views */}
                <div className={combineClasses(
                  'flex items-center px-3 py-2',
                  themeClasses.spacing.gapSmall,
                  themeClasses.text.muted
                )}>
                  <FaEye className={themeClasses.icons.sm} />
                  <span className={themeClasses.typography.weightMedium}>
                    {post.views || 0}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.image_title && (
            <div className={themeClasses.spacing.marginBottomXLarge}>
              <img
                src={post.image_title}
                alt={post.title}
                className={combineClasses(
                  'w-full h-auto',
                  themeClasses.effects.rounded
                )}
                loading="eager"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <div
              className={combineClasses(
                'post-content reading-content leading-relaxed',
                themeClasses.text.primary
              )}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className={combineClasses(
            'sticky top-24',
            themeClasses.spacing.stackLarge
          )}>
            {/* Table of Contents */}
            <TableOfContents content={post.content} />
          </div>
        </aside>
      </div>
      </div>
    </>
  );
};

export default PostDetail;