// components/Post/PostItemProfile.js
import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from "react-icons/fa6";
import AddCommentForm from '../Comment/AddCommentForm';
import CommentItem from '../Comment/CommentItem';
import TextUtils from '../Utils/TextUtils';
import SafeImage from '../Utils/SafeImage';
import { useUser } from '../../context/UserContext';
import { usePostClap } from '../../hooks/usePostClap';
import { usePostComments } from '../../hooks/usePostComments';
import TimeAgo from '../Utils/TimeAgo';
import { useRouter } from 'next/router';
import { deletePost } from '../../services/postService';

const PostItemProfile = ({ post, isOwner }) => {
  if (!post) {
    return (
      <div className="bg-surface rounded-xl py-4 sm:py-6 border border-border-primary">
        <div className="text-muted">Đang tải bài viết...</div>
      </div>
    );
  }

  const { user } = useUser();
  const router = useRouter();
  
  // Use reusable hooks
  const { currentClapCount, clapLoading, handleClap } = usePostClap(post.clap_count || 0);
  const {
    isCommentsOpen,
    comments,
    totalCount,
    totalCommentReply,
    isLoading,
    isError,
    handleAddComment,
    toggleComments,
    mutate,
  } = usePostComments(post.id, false, 10); // Use regular comments

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id);
        alert('Post deleted successfully!');
        router.reload();
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  return (
    <div className="w-full">
      <article className="rounded-xl hover:shadow-lg transition-all duration-300">
        <div className="flex py-6 border-b border-border-primary/20">
          {/* Left Side - Content (2/3) */}
          <div className="flex-1 pr-6 flex flex-col">
            <div className="flex-1">
              {/* Post Title */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-xl md:text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 line-clamp-2 mb-3">
                  {post.title}
                </h2>
              </Link>

              {/* Content Preview */}
              <div className="text-text-secondary text-sm sm:text-base line-clamp-3 sm:line-clamp-4 lg:line-clamp-6 mb-3 sm:mb-4 leading-relaxed">
                <TextUtils html={post.preview_content || post.content} maxLength={200} />
              </div>

              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.slice(0, 2).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${(category.name || category).toLowerCase()}`}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {category.name || category}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar - Bottom of left content */}
            <div className="flex items-center justify-between text-text-secondary mt-auto">
              <div className="flex items-center gap-4">
                {/* Claps */}
                <button
                  onClick={() => handleClap(post.id)}
                  disabled={clapLoading}
                  className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
                >
                  <FaHandsClapping className="w-4 h-4" />
                  <span className="text-sm">{currentClapCount}</span>
                </button>

                {/* Comments */}
                <button
                  onClick={toggleComments}
                  className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
                >
                  <FaComment className="w-4 h-4" />
                  <span className="text-sm">{post.comments_count || 0}</span>
                </button>

                {/* Views */}
                <div className="flex items-center gap-1 text-muted">
                  <FaEye className="w-4 h-4" />
                  <span className="text-sm">{post.views || 0}</span>
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="flex text-text-secondary items-center space-x-2">
                  <Link href={`/edit/${post.title_name}`}>
                    <button className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit post">
                      <FaEdit className="w-4 h-4 text-text-secondary" />
                    </button>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-text-secondary text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Delete post"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Image (1/3) - Match PostItemTimeline */}
          {post.image_title && (
            <div className="w-1/3 flex  items-end">
              <Link href={`/p/${post.title_name}`} className="w-full">
                <div className="relative w-full h-32 md:h-40 lg:h-48">
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300 rounded-lg"
                    sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                  />
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Comments Section - Inline like PostItemTimeline */}
        {isCommentsOpen && (
          <div className="border-t border-border-primary bg-surface-secondary">
            {/* Add Comment Form */}
            <div className="p-6 border-b border-border-secondary">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <div className="text-center py-4">
                  <span className="text-muted text-sm">Please login to comment</span>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="p-6">
              {isError && (
                <div className="text-danger text-sm text-center py-4">
                  Failed to load comments
                </div>
              )}
              
              {isLoading && comments.length === 0 && (
                <div className="flex justify-center items-center py-6">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-secondary text-sm">Loading comments...</span>
                </div>
              )}

              {comments && comments.length > 0 && (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                  ))}
                </div>
              )}

              {!isLoading && !isError && comments.length === 0 && (
                <div className="text-center py-6">
                  <span className="text-muted text-sm">No comments yet</span>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostItemProfile;
