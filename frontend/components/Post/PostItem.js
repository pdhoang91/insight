// components/Post/PostItem.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaComment, FaBookmark, FaRegBookmark, FaShareAlt, FaCalendar, FaUser } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import useBookmark from '../../hooks/useBookmark';
import { useComments } from '../../hooks/useComments';
import CommentsPopup from '../Comment/CommentsPopup';
import AuthorInfo from '../Auth/AuthorInfo';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';
import { BASE_FE_URL } from '../../config/api';

const PostItem = ({ post, variant = 'default' }) => {
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

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  const shareUrl = `${BASE_FE_URL}/p/${post.title_name}`;

  const handleShare = () => {
    setShareMenuOpen((prev) => !prev);
  };

  // List variant for traditional blog layout
  if (variant === 'list') {
    return (
      <>
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Content Section */}
            <div className="flex-1">
              {/* Post Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <FaUser className="w-3 h-3" />
                  <span>{post.user?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaCalendar className="w-3 h-3" />
                  <TimeAgo timestamp={post.created_at} />
                </div>
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {post.categories.slice(0, 2).map((category, index) => (
                      <Link
                        key={index}
                        href={`/category/${category.toLowerCase()}`}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h2>
              </Link>

              {/* Excerpt */}
              <div className="text-gray-600 mb-4 leading-relaxed">
                <TextUtils html={post.preview_content} maxLength={200} />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleClap}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                    aria-label="Clap for this post"
                  >
                    <FaHandsClapping className="w-4 h-4" />
                    <span className="text-sm font-medium">{clapsCount}</span>
                  </button>

                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                    aria-label="View comments"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm font-medium">{totalCommentReply}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleBookmark}
                    disabled={bookmarkLoading}
                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                  >
                    {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                  </button>

                  <div className="relative" ref={shareMenuRef}>
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-500 hover:text-green-500 transition-colors"
                      aria-label="Share this post"
                    >
                      <FaShareAlt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Section */}
            {post.image_title && (
              <div className="md:w-48 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative h-32 md:h-32 w-full rounded-lg overflow-hidden">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 192px"
                    />
                  </div>
                </Link>
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
  }

  // Card variant for grid layout
  if (variant === 'card') {
    return (
      <>
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          {/* Featured Image */}
          {post.image_title && (
            <div className="relative h-48 w-full">
              <SafeImage
                src={post.image_title}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          <div className="p-6">
            {/* Author Info */}
            <div className="flex items-center space-x-2 mb-4">
              <AuthorInfo author={post.user} variant="compact" />
              <span className="text-gray-400">•</span>
              <TimeAgo timestamp={post.created_at} />
            </div>

            {/* Title */}
            <Link href={`/p/${post.title_name}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                {post.title}
              </h3>
            </Link>

            {/* Excerpt */}
            <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
              <TextUtils html={post.preview_content} maxLength={150} />
            </p>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.slice(0, 2).map((category, index) => (
                  <Link
                    key={index}
                    href={`/category/${category.toLowerCase()}`}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
                {post.categories.length > 2 && (
                  <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs">
                    +{post.categories.length - 2} more
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleClap}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Clap for this post"
                >
                  <FaHandsClapping className="w-4 h-4" />
                  <span className="text-sm">{clapsCount}</span>
                </button>

                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                  aria-label="View comments"
                >
                  <FaComment className="w-4 h-4" />
                  <span className="text-sm">{totalCommentReply}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                >
                  {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                </button>

                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-green-500 transition-colors"
                    aria-label="Share this post"
                  >
                    <FaShareAlt className="w-4 h-4" />
                  </button>
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
  }

  // Timeline variant for horizontal timeline layout
  if (variant === 'timeline') {
    return (
      <>
        <article className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:shadow-xl hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Content Section - Left side */}
            <div className="flex-1 p-6">
              {/* Author and Meta */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 text-xs font-mono font-bold">
                    {post.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="font-medium text-gray-300 font-mono">{post.user?.name || 'Anonymous'}</span>
                  <span>•</span>
                  <TimeAgo timestamp={post.created_at} />
                </div>
              </div>

              {/* Title */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-xl font-bold text-white hover:text-green-400 transition-colors duration-200 line-clamp-2 mb-3">
                  {post.title}
                </h2>
              </Link>

              {/* Preview Content */}
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                <TextUtils html={post.preview_content} maxLength={200} />
              </p>

              {/* Categories and Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories && post.categories.slice(0, 2).map((category, index) => (
                  <Link
                    key={index}
                    href={`/category/${category.toLowerCase()}`}
                    className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs font-medium hover:bg-blue-900/50 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
                {post.tags && post.tags.slice(0, 2).map((tag, index) => (
                  <Link
                    key={index}
                    href={`/tag/${tag.toLowerCase()}`}
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 hover:text-yellow-400 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-6">
                  {/* Clap Button */}
                  <button
                    onClick={handleClap}
                    disabled={clapsLoading}
                    className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Clap for this post"
                  >
                    <FaHandsClapping className="w-4 h-4" />
                    <span className="text-sm font-mono">{clapsCount}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label="View comments"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm font-mono">{totalCommentReply}</span>
                  </button>

                  <span className="text-gray-500 text-sm font-mono">
                    {post.views || 0} views
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Bookmark Button */}
                  <button
                    onClick={toggleBookmark}
                    disabled={bookmarkLoading}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all"
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                  >
                    {isBookmarked ? <FaBookmark className="w-4 h-4" /> : <FaRegBookmark className="w-4 h-4" />}
                  </button>

                  {/* Share Button */}
                  <div className="relative" ref={shareMenuRef}>
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-all"
                      aria-label="Share this post"
                    >
                      <FaShareAlt className="w-4 h-4" />
                    </button>

                    {/* Share Menu */}
                    {isShareMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-10">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            setShareMenuOpen(false);
                            alert('Link copied to clipboard!');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors font-mono"
                        >
                          Copy Link
                        </button>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors font-mono"
                          onClick={() => setShareMenuOpen(false)}
                        >
                          Share on Twitter
                        </a>
                      </div>
                    )}
                  </div>

                  <span className="text-gray-500 text-sm font-mono">
                    {Math.ceil((post.preview_content?.length || 0) / 200)} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Image Section - Right side on desktop */}
            {post.image_title && (
              <div className="w-full md:w-80 h-48 md:h-auto relative">
                <Link href={`/p/${post.title_name}`}>
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </Link>
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
  }

  // Default list variant (original layout) - keeping for backward compatibility
  return (
    <>
      <div className="rounded-lg p-3 mb-6 bg-white transition-shadow duration-300">
        <div className="flex flex-col md:flex-row pl-2">
          {/* Post Section */}
          <div className="w-full md:w-2/3 pr-0 md:pr-4">
            {/* Author Information */}
            <AuthorInfo author={post.user} />

            {/* Post Title */}
            <Link href={`/p/${post.title_name}`}>
              <h5 className="text-lg text-gray-800 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {post.title}
              </h5>
            </Link>

            {/* Post Preview Content */}
            <p className="text-gray-600 text-sm line-clamp-2">
              <TextUtils html={post.preview_content} maxLength={200} />
            </p>

            {/* Interaction Buttons */}
            <div className="flex flex-wrap items-center justify-between mt-4 space-y-2 md:space-y-0">
              <div className="flex items-center space-x-4">
                <TimeAgo timestamp={post.created_at} />
                {/* Clap Button */}
                <button
                  onClick={handleClap}
                  className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                  aria-label="Clap for this post"
                >
                  <FaHandsClapping className="mr-1" /> {clapsCount}
                </button>

                {/* Comment Button */}
                <button
                  onClick={toggleCommentPopup}
                  className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
                  aria-label="View comments"
                >
                  <FaComment className="mr-1" /> {totalCommentReply}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {/* Bookmark Button */}
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                >
                  {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                </button>

                {/* Share Button */}
                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={handleShare}
                    className="flex items-center text-gray-600 hover:text-green-500 transition-colors"
                    aria-label="Share this post"
                  >
                    <FaShareAlt />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          {post.image_title && (
            <div className="w-full md:w-1/3 mt-4 md:mt-0">
              <Link href={`/p/${post.title_name}`}>
                <div className="relative h-32 md:h-24 w-full rounded-lg overflow-hidden">
                  <SafeImage
                    src={post.image_title}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </Link>
            </div>
          )}
        </div>
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
    </>
  );
};

export default PostItem;
