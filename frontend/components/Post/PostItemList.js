// components/Post/PostItemList.js
import React, { useState } from 'react';
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

const PostItemList = ({ post }) => {
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
                        href={`/category/${(category.name || category).toLowerCase()}`}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        {category.name || category}
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
                  disabled={clapLoading}
                  className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  aria-label="Clap for this post"
                >
                  <FaHandsClapping className="w-4 h-4" />
                </button>
                <span className="text-xs text-center text-muted">{currentClapCount}</span>

                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  aria-label="View comments"
                >
                  <FaComment className="w-4 h-4" />
                </button>
                <span className="text-xs text-center text-muted">{totalCommentReply}</span>

                {/* Views */}
                <div className="flex flex-col items-center">
                  <FaEye className="w-4 h-4 text-muted" />
                  <span className="text-xs text-center text-muted">{post.views || 0}</span>
                </div>

                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                  aria-label="View comments"
                >
                  <FaComment className="w-4 h-4" />
                </button>
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