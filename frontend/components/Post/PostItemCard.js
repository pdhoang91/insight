// components/Post/PostItemCard.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaComment, FaEye } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import CommentsPopup from '../Comment/CommentsPopup';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

const PostItemCard = ({ post }) => {
  if (!post) {
    return <div>Loading post...</div>;
  }

  const { user } = useUser();
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
      setCurrentClapCount((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('An error occurred while clapping. Please try again.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => setCommentsOpen((prev) => !prev);
  const closeCommentPopup = () => setCommentsOpen(false);

  return (
    <>
      <article className="bg-surface rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        {/* Featured Image */}
        {post.image_title && (
          <div className="relative h-44 w-full">
            <SafeImage
              src={post.image_title}
              alt={post.title}
              fill
              className="object-cover rounded-t-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl" />
          </div>
        )}

        <div className="p-5">
          {/* Compact Author Info */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary text-xs font-bold">
                {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted">
              <span className="font-medium">{post.user?.name || 'Anonymous'}</span>
              <span>•</span>
              <TimeAgo timestamp={post.created_at} />
            </div>
          </div>

          {/* Title */}
          <Link href={`/p/${post.title_name}`}>
            <h3 className="text-lg font-bold text-primary mb-2 hover:text-primary-hover transition-colors leading-tight line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <div className="text-secondary text-sm mb-4 leading-relaxed">
            <TextUtils html={post.preview_content} maxLength={150} />
          </div>

          {/* Categories - Compact */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
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

          {/* Actions - Compact */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center space-x-3">
              {/* Views */}
              <div className="flex items-center space-x-1 text-muted">
                <FaEye className="w-3 h-3" />
                <span className="text-xs font-medium">{post.views || 0}</span>
              </div>

              <button
                onClick={handleClap}
                disabled={clapLoading}
                className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                aria-label="Clap for this post"
              >
                <FaHandsClapping className="w-3 h-3" />
                <span className="text-xs font-medium">{currentClapCount}</span>
              </button>

              <button
                onClick={toggleCommentPopup}
                className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                aria-label="View comments"
              >
                <FaComment className="w-3 h-3" />
                <span className="text-xs font-medium">{post.comments_count || 0}</span>
              </button>
            </div>

            <div className="flex items-center space-x-1">
              
            </div>
          </div>
        </div>
      </article>

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
    </>
  );
};

export default PostItemCard; 