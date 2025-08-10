// components/Post/PostItemProfile.js
import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from "react-icons/fa6";
import CommentsPopup from '../Comment/CommentsPopup';
import Rating from './Rating';
import TextUtils from '../Utils/TextUtils';
import SafeImage from '../Utils/SafeImage';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import TimeAgo from '../Utils/TimeAgo';
import { useRouter } from 'next/router';
import { deletePost } from '../../services/postService';

const PostItemProfile = ({ post, isOwner }) => {
  if (!post) {
    return (
      <div className="bg-surface rounded-xl p-6">
        <div className="text-muted">Loading post...</div>
      </div>
    );
  }

  const { user } = useUser();
  const router = useRouter();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);

  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, true, 1, 10);

  const handleClap = async () => {
    if (!user) {
      alert('You need to login to clap.');
      return;
    }
    if (clapLoading) return;
    
    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('An error occurred while clapping. Please try again.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => setCommentsOpen((prev) => !prev);
  const closeCommentPopup = () => setCommentsOpen(false);

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
    <div className="bg-surface rounded-xl hover:shadow-lg transition-all duration-300 border border-border-primary">
      <div className="flex p-6">
        {/* Content Section */}
        <div className="flex-1 pr-6">
          {/* Post Title */}
          <Link href={`/p/${post.title_name}`}>
            <h2 className="text-xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 line-clamp-2 mb-3">
              {post.title}
            </h2>
          </Link>

          {/* Content Preview */}
          <div className="text-secondary text-sm line-clamp-2 mb-4">
            <TextUtils html={post.preview_content || post.content} maxLength={150} />
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-muted mb-4">
            <div className="flex items-center space-x-4">
              <TimeAgo timestamp={post.created_at} />
              <span>•</span>
              <span>{Math.ceil((post.content?.replace(/<[^>]*>/g, '').length || 0) / 200) || 1} min read</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Views */}
              <div className="flex items-center space-x-1 text-muted">
                <FaEye className="w-4 h-4" />
                <span className="text-sm">{post.views || 0}</span>
              </div>

              {/* Claps */}
              <button
                onClick={handleClap}
                disabled={clapLoading}
                className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
              >
                <FaHandsClapping className="w-4 h-4" />
                <span className="text-sm">{currentClapCount}</span>
              </button>

              {/* Comments */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
              >
                <FaComment className="w-4 h-4" />
                <span className="text-sm">{post.comments_count || 0}</span>
              </button>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center space-x-2">
                <Link href={`/edit/${post.title_name}`}>
                  <button className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit post">
                    <FaEdit className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  title="Delete post"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Section */}
        {post.image_title && (
          <div className="w-1/3 flex items-center">
            <Link href={`/p/${post.title_name}`}>
              <div className="relative w-full h-32 overflow-hidden rounded-lg">
                <SafeImage
                  src={post.image_title}
                  alt={post.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 33vw, 33vw"
                />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Comments Popup */}
      {isCommentsOpen && (
        <CommentsPopup
          postId={post.id}
          comments={comments}
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          mutate={mutate}
          onClose={closeCommentPopup}
        />
      )}

      {/* Rating Section */}
      {user && (
        <div className="px-6 pb-6">
          <Rating postId={post.id} userId={user.id} />
        </div>
      )}
    </div>
  );
};

export default PostItemProfile;
