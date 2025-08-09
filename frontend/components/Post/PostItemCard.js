// components/Post/PostItemCard.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaComment, FaBookmark, FaRegBookmark, FaShareAlt } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import useBookmark from '../../hooks/useBookmark';
import { useComments } from '../../hooks/useComments';
import CommentsPopup from '../Comment/CommentsPopup';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import { BASE_FE_URL } from '../../config/api';

const PostItemCard = ({ post }) => {
  if (!post) {
    return <div>Loading post...</div>;
  }

  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmark(post.id);
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [isShareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef();

  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, true, 1, 10);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClap = async () => {
    if (!user) {
      alert('You need to login to clap.');
      return;
    }
    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      mutateClaps();
      alert('An error occurred while clapping. Please try again.');
    }
  };

  const toggleCommentPopup = () => setCommentsOpen((prev) => !prev);
  const closeCommentPopup = () => setCommentsOpen(false);
  const shareUrl = `${BASE_FE_URL}/p/${post.title_name}`;
  const handleShare = () => setShareMenuOpen((prev) => !prev);

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
                  href={`/category/${category.toLowerCase()}`}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          )}

          {/* Actions - Compact */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClap}
                className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                aria-label="Clap for this post"
              >
                <FaHandsClapping className="w-3 h-3" />
                <span className="text-xs font-medium">{clapsCount}</span>
              </button>

              <button
                onClick={toggleCommentPopup}
                className="flex items-center space-x-1 text-muted hover:text-primary transition-colors"
                aria-label="View comments"
              >
                <FaComment className="w-3 h-3" />
                <span className="text-xs font-medium">{totalCommentReply}</span>
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                className="p-1 text-muted hover:text-primary transition-colors"
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
              >
                {isBookmarked ? <FaBookmark className="w-3 h-3" /> : <FaRegBookmark className="w-3 h-3" />}
              </button>

              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={handleShare}
                  className="p-1 text-muted hover:text-primary transition-colors"
                  aria-label="Share this post"
                >
                  <FaShareAlt className="w-3 h-3" />
                </button>

                {/* Share Menu */}
                {isShareMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-32 bg-surface rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setShareMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 text-xs text-secondary hover:text-primary hover:bg-elevated transition-colors"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => {
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank');
                        setShareMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 text-xs text-secondary hover:text-primary hover:bg-elevated transition-colors"
                    >
                      Twitter
                    </button>
                  </div>
                )}
              </div>
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