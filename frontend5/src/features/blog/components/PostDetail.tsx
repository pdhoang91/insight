'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaShareAlt, FaRegBookmark, FaBookmark, FaRegComments, FaHeart } from 'react-icons/fa';
import { Post } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useClapsCount } from '@/hooks/useClaps';
import { useBookmark } from '@/hooks/useBookmark';
import { useComments } from '@/hooks/useComments';
import { BASE_FE_URL } from '@/config/api';
import { LoadingSpinner } from '@/components/ui';
import CommentSection from '@/features/comments/components/CommentSection';

interface PostDetailProps {
  post: Post;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post }) => {
  const { user, isAuthenticated } = useAuth();
  const { clapsCount, hasClapped, loading: clapLoading, clapPost } = useClapsCount('post', post.id);
  const { isBookmarked, loading: bookmarkLoading, toggleBookmark } = useBookmark(post.id);
  const { totalCount: commentCount, mutate: mutateComments } = useComments(post.id, true, 1, 10);
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const handleClap = async () => {
    if (!isAuthenticated) {
      alert('You need to login to clap.');
      return;
    }

    try {
      await clapPost();
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Failed to clap. Please try again.');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert('You need to login to bookmark.');
      return;
    }

    try {
      await toggleBookmark();
    } catch (error) {
      console.error('Failed to bookmark:', error);
      alert('Failed to bookmark. Please try again.');
    }
  };

  const toggleCommentSection = () => {
    setCommentsOpen((prev) => !prev);
  };

  const shareUrl = `${BASE_FE_URL}/blog/${post.slug}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!post) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-4">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-semibold text-gray-900">{post.author.username}</div>
              <div className="text-sm text-gray-600">
                {formatDate(post.publishedAt || post.createdAt)} · {post.readTime} min read
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaEye className="w-4 h-4" />
            <span>{post.viewsCount.toLocaleString()} views</span>
          </div>
        </div>

        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: category.bgColor || '#f3f4f6',
                  color: category.color || '#374151'
                }}
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {post.image && (
          <div className="mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl"
            />
          </div>
        )}
      </header>

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-b border-gray-200 py-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Clap Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClap}
              disabled={clapLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                hasClapped
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${clapLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {clapLoading ? (
                <LoadingSpinner />
                             ) : (
                 <FaHeart className="w-5 h-5" />
               )}
              <span>{clapsCount || post.likesCount}</span>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCommentSection}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <FaRegComments className="w-5 h-5" />
              <span>{commentCount || post.commentsCount}</span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Bookmark Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'text-gray-600 hover:text-gray-700'
              } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {bookmarkLoading ? (
                <LoadingSpinner />
              ) : isBookmarked ? (
                <FaBookmark className="w-5 h-5" />
              ) : (
                <FaRegBookmark className="w-5 h-5" />
              )}
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2 rounded-full text-gray-600 hover:text-gray-700 transition-colors"
            >
              <FaShareAlt className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
                     <CommentSection 
             postId={post.id} 
           />
        </motion.div>
      )}

      {/* Author Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          {post.author.avatar && (
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {post.author.username}
            </h3>
            {post.author.bio && (
              <p className="text-gray-600 mb-3">{post.author.bio}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{post.author.followersCount} followers</span>
              <span>{post.author.postsCount} posts</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default PostDetail; 