// components/Post/BasePostItem.js
import React from 'react';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash, FaChevronRight } from 'react-icons/fa';
import { FaHandsClapping, FaRegComments } from "react-icons/fa6";
import { useRouter } from 'next/router';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import { AddCommentForm, LimitedCommentList } from '../Comment';
import { useClapsCount } from '../../hooks/useClapsCount';
import { useComments } from '../../hooks/useComments';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import useCommentActions from '../../hooks/useCommentActions';
import { deletePost } from '../../services/postService';
import { BASE_FE_URL } from '../../config/api';
import { themeClasses, componentClasses, combineClasses } from '../../utils/themeClasses';

const BasePostItem = ({ 
  post, 
  variant = 'default', // 'default' | 'profile' | 'small'
  isOwner = false,
  showComments = true,
  showClaps = true,
  showActions = false 
}) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }

  const router = useRouter();
  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { 
    isCommentsOpen, 
    handleClap, 
    toggleCommentPopup, 
    closeCommentPopup, 
    user 
  } = useCommentActions(post.id, mutateClaps);

  // Different comment hooks based on variant
  const useCommentsHook = variant === 'profile' ? useComments : useInfiniteComments;
  const commentsData = variant === 'profile' 
    ? useCommentsHook(post.id, true, 1, 10)
    : useCommentsHook(post.id, isCommentsOpen, 3);

  const { comments, totalCount, isLoading, isError, mutate, canLoadMore, loadMore } = commentsData;

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deletePost(post.id);
        router.reload();
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Đã xảy ra lỗi khi xóa bài viết. Vui lòng thử lại sau.');
      }
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/p/${post.title_name}`;
    navigator.clipboard.writeText(url);
    alert('Đã sao chép link bài viết!');
  };

  // Small variant - minimal display
  if (variant === 'small') {
    return (
      <article className={combineClasses(
        themeClasses.bg.card,
        'pb-4 mb-6'
      )}>
        <div className={`${themeClasses.responsive.flexTabletRow} items-start ${themeClasses.spacing.gap}`}>
          <div className={combineClasses(
            'flex-1 min-w-0 pb-3',
          )}>
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
          <div className="flex-shrink-0">
            <FaChevronRight className={combineClasses(
              themeClasses.icons.sm,
              'text-medium-accent-blue'
            )} />
          </div>
        </div>
      </article>
    );
  }

  // Default and Profile variants - full display
  return (
    <article className={combineClasses(
      themeClasses.bg.card,
      'p-6 mb-6',
      themeClasses.effects.rounded,
      themeClasses.effects.shadow,
      'border',
    )}>
      <div className={combineClasses(
        themeClasses.layout.flexRow,
        themeClasses.spacing.gap,
        'items-start'
      )}>
        
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <Link href={`/${post.author?.username || 'unknown'}`}>
            <img
              src={post.author?.avatar_url || '/author-avatar.svg'}
              alt={post.author?.display_name || 'Author'}
              className={combineClasses(
                'w-12 h-12 rounded-full object-cover',
,
                themeClasses.animations.smooth
              )}
            />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/p/${post.title_name}`} className={`block ${themeClasses.spacing.marginBottom}`}>
            <h2 className={`${componentClasses.heading.h3} ${themeClasses.interactive.link} line-clamp-3 text-balance`}>
              {post.title}
            </h2>
          </Link>

          {/* Author Info */}
          <div className={`flex items-center ${componentClasses.text.bodySmall} ${themeClasses.spacing.marginBottomSmall}`}>
            <Link href={`/${post.author?.username || 'unknown'}`} className={themeClasses.interactive.link}>
              {post.author?.display_name || 'Unknown Author'}
            </Link>
            <span className={combineClasses(
              'mx-2',
              themeClasses.text.muted
            )}>·</span>
            <TimeAgo timestamp={post.created_at} className="text-medium-text-muted" />
          </div>

          {/* Preview Content */}
          <p className={`${componentClasses.text.bodyMedium} line-clamp-3 text-pretty ${themeClasses.spacing.marginBottom}`}>
            <TextUtils html={post.preview_content} maxLength={200} />
          </p>

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${themeClasses.spacing.marginBottomSmall}`}>
              {post.categories.slice(0, 3).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.name}`}
                  className={`${componentClasses.text.bodyTiny} ${themeClasses.patterns.tag} ${themeClasses.interactive.tagHover} px-2 py-1 rounded-full`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className={combineClasses(
              'flex items-center',
              themeClasses.spacing.gapSmall
            )}>
              
              {/* Clap Button */}
              {showClaps && (
                <button
                  onClick={handleClap}
                  disabled={clapsLoading}
                  className={combineClasses(
                    'flex items-center space-x-1 px-3 py-1 rounded-full',
                    themeClasses.interactive.buttonSecondary,
                    themeClasses.animations.smooth,
                    'hover:bg-medium-accent-green/10'
                  )}
                >
                  <FaHandsClapping className={`${themeClasses.icons.sm} ${clapsLoading ? 'animate-pulse' : ''}`} />
                  <span className={componentClasses.text.bodySmall}>{clapsCount || 0}</span>
                </button>
              )}

              {/* Comment Button */}
              {showComments && (
                <button
                  onClick={toggleCommentPopup}
                  className={combineClasses(
                    'flex items-center space-x-1 px-3 py-1 rounded-full',
                    themeClasses.interactive.buttonSecondary,
                    themeClasses.animations.smooth,
                    'hover:bg-medium-accent-blue/10'
                  )}
                >
                  <FaRegComments className={themeClasses.icons.sm} />
                  <span className={componentClasses.text.bodySmall}>{totalCount || 0}</span>
                </button>
              )}

              {/* View Count */}
              <div className={combineClasses(
                'flex items-center space-x-1',
                themeClasses.text.muted
              )}>
                <FaEye className={themeClasses.icons.sm} />
                <span className={componentClasses.text.bodySmall}>{post.view_count || 0}</span>
              </div>
            </div>

            {/* Owner Actions */}
            {showActions && isOwner && (
              <div className={combineClasses(
                'flex items-center',
                themeClasses.spacing.gapSmall
              )}>
                <Link
                  href={`/edit/${post.id}`}
                  className={combineClasses(
                    themeClasses.interactive.buttonSecondary,
                    'p-2 rounded-full hover:bg-medium-accent-blue/10'
                  )}
                >
                  <FaEdit className={themeClasses.icons.sm} />
                </Link>
                <button
                  onClick={handleDelete}
                  className={combineClasses(
                    themeClasses.interactive.buttonSecondary,
                    'p-2 rounded-full hover:bg-red-500/10 text-red-500'
                  )}
                >
                  <FaTrash className={themeClasses.icons.sm} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && isCommentsOpen && (
        <div className={combineClasses(
          'mt-6 pt-6',
        )}>
          <div className={themeClasses.spacing.marginBottom}>
            <AddCommentForm 
              postId={post.id} 
              onCommentAdded={() => {
                mutate();
                closeCommentPopup();
              }}
            />
          </div>
          <LimitedCommentList
            comments={comments}
            isLoading={isLoading}
            isError={isError}
            canLoadMore={canLoadMore}
            onLoadMore={loadMore}
          />
        </div>
      )}
    </article>
  );
};

export default BasePostItem;
