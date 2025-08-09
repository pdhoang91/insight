// components/Post/PostItemList.js
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

const PostItemList = ({ post }) => {
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
      <article className="bg-surface rounded-xl hover:shadow-md transition-all duration-300">
        <div className="flex">
          {/* Left Side - Content */}
          <div className="flex-1 p-6">
            {/* Compact Meta Info */}
            <div className="flex items-center space-x-3 text-xs text-muted mb-3">
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">
                    {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="font-medium">{post.user?.name || 'Anonymous'}</span>
              </div>
              <span>•</span>
              <TimeAgo timestamp={post.created_at} />
              
              {/* Compact Categories */}
              {post.categories && post.categories.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    {post.categories.slice(0, 2).map((category, index) => (
                      <Link
                        key={index}
                        href={`/category/${category.toLowerCase()}`}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Title - More Prominent */}
            <Link href={`/p/${post.title_name}`}>
              <h2 className="text-xl md:text-2xl font-bold text-primary mb-3 hover:text-primary-hover transition-colors leading-tight line-clamp-2">
                {post.title}
              </h2>
            </Link>

            {/* Content Preview - Larger */}
            <div className="text-secondary mb-4 leading-relaxed text-sm md:text-base line-clamp-2">
              <TextUtils html={post.preview_content} maxLength={200} />
            </div>
          </div>

          {/* Right Side - Image and Actions in same row */}
          {post.image_title && (
            <div className="flex items-center space-x-4 p-4">
              {/* Image */}
              <Link href={`/p/${post.title_name}`}>
                <div className="relative w-32 md:w-40 lg:w-48 h-24 md:h-30 lg:h-36">
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300 rounded-lg"
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                  />
                </div>
              </Link>

              {/* Actions - Same horizontal line as image */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleClap}
                  className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  aria-label="Clap for this post"
                >
                  <FaHandsClapping className="w-4 h-4" />
                </button>
                <span className="text-xs text-center text-muted">{clapsCount}</span>

                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  aria-label="View comments"
                >
                  <FaComment className="w-4 h-4" />
                </button>
                <span className="text-xs text-center text-muted">{totalCommentReply}</span>

                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                >
                  {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                </button>

                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    aria-label="Share this post"
                  >
                    <FaShareAlt className="w-4 h-4" />
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
          )}
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

export default PostItemList; 