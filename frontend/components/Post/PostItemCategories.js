import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaComment, FaHandsClapping, FaTag } from 'react-icons/fa';
import { FaHandsClapping as FaHandsClappingRegular } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import SafeImage from '../Utils/SafeImage';
import TimeAgo from '../Utils/TimeAgo';
import TextUtils from '../Utils/TextUtils';
import CommentsPopup from '../Comment/CommentsPopup';
import { useComments } from '../../hooks/useComments';
import { clapPost } from '../../services/activityService';

const PostItemCategories = ({ post }) => {
  const { user } = useUser();
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);
  const [clapLoading, setClapLoading] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Comments hook
  const { comments, totalCount, isLoading, isError, mutate } = useComments(
    post.id,
    isCommentsOpen,
    1,
    10
  );

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
    } catch (err) {
      console.error('Failed to clap post:', err);
      alert('Failed to clap post. Please try again.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  const closeCommentPopup = () => {
    setIsCommentsOpen(false);
  };

  return (
    <>
      <article className="bg-surface rounded-lg hover:shadow-lg transition-all duration-300 border border-border-primary/30 overflow-hidden">
        <div className="p-6">
          {/* Header with author and meta info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm font-bold">
                {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted min-w-0">
              <span className="font-medium text-secondary truncate">
                {post.user?.name || 'Anonymous'}
              </span>
              <span>•</span>
              <TimeAgo timestamp={post.created_at} />
              <span>•</span>
              <span className="hidden sm:inline">{Math.ceil((post.content?.replace(/<[^>]*>/g, '').length || 0) / 200) || 1} min read</span>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-xl md:text-2xl font-bold text-primary hover:text-primary-hover transition-colors duration-200 line-clamp-2 mb-3 leading-tight">
                  {post.title}
                </h2>
              </Link>

              {/* Content Preview */}
              <div className="text-secondary text-sm md:text-base line-clamp-3 mb-4 leading-relaxed">
                <TextUtils html={post.preview_content || post.content} maxLength={180} />
              </div>

              {/* Categories - Show current category and related ones */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.slice(0, 3).map((category, index) => (
                    <Link
                      key={index}
                      href={`/category/${(category.name || category).toLowerCase()}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      <FaTag className="w-3 h-3" />
                      <span>{category.name || category}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Image */}
            {post.image_title && (
              <div className="w-32 md:w-40 lg:w-48 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative w-full h-24 md:h-32 lg:h-36 rounded-lg overflow-hidden">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                    />
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border-primary/20">
            <div className="flex items-center gap-6">
              {/* Views */}
              <div className="flex items-center gap-2 text-muted">
                <FaEye className="w-4 h-4" />
                <span className="text-sm font-mono">{post.views || 0}</span>
              </div>

              {/* Claps */}
              <button
                onClick={handleClap}
                disabled={clapLoading}
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors disabled:opacity-50"
              >
                <FaHandsClappingRegular className="w-4 h-4" />
                <span className="text-sm font-mono">{currentClapCount}</span>
              </button>

              {/* Comments */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
              >
                <FaComment className="w-4 h-4" />
                <span className="text-sm font-mono">{post.comments_count || 0}</span>
              </button>
            </div>

            {/* Read More Link */}
            <Link 
              href={`/p/${post.title_name}`}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Read more →
            </Link>
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

export default PostItemCategories; 