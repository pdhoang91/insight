// components/Post/PostItem.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaShareAlt, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { FaHandsClapping, FaRegComments } from "react-icons/fa6";
import CommentsPopup from '../Comment/CommentsPopup';
import Rating from './Rating';
import TextUtils from '../Utils/TextUtils';
import AuthorInfo from '../Auth/AuthorInfo';
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import useBookmark from '../../hooks/useBookmark';
import { useComments } from '../../hooks/useComments';
import ShareMenu from '../Utils/ShareMenu';
import TimeAgo from '../Utils/TimeAgo';

const PostItem = ({ post }) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
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
      alert('Bạn cần đăng nhập để clap.');
      return;
    }
    try {
      //mutateClaps((current) => current + 1, false);
      console.log('clapPost:', post.id);
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      mutateClaps();
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  const shareUrl = `http://localhost:3000/p/${post.title_name}`;

  const handleShare = () => {
    setShareMenuOpen((prev) => !prev);
  };

  return (
    <div
      className="rounded-lg p-6 mb-6 bg-white transition-shadow duration-300"
    >
      <div className="flex flex-col md:flex-row">
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

          {/* Rating Component */}
          <Rating postId={post.id} />

          {/* Interaction Buttons */}
          <div className="flex flex-wrap items-center justify-between mt-4 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Nút Clap */}
              <button
                onClick={handleClap}
                className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                aria-label="Clap for this post"
              >
                <FaHandsClapping className="mr-1" /> {clapsCount}
              </button>

              {/* Nút Comment */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
                aria-label="View comments"
              >
                <FaRegComments className="mr-1" /> {totalCommentReply}
              </button>

              {/* Số lượng View */}
              <span className="flex items-center text-gray-600">
                <FaEye className="mr-1" /> {post.views}
              </span>
              <TimeAgo timestamp={post.created_at} />
            </div>

            <div className="flex items-center space-x-4">
              {/* Nút Bookmark */}
              <button
                onClick={toggleBookmark}
                className="flex items-center text-gray-600 hover:text-yellow-500 transition-colors"
                disabled={bookmarkLoading}
                aria-label="Bookmark this post"
              >
                {isBookmarked ? <FaBookmark className="mr-1" /> : <FaRegBookmark className="mr-1" />}
                {bookmarkLoading && <span className="text-sm">...</span>}
              </button>

              {/* Nút Share */}
              <div ref={shareMenuRef} className="relative">
                <button
                  onClick={handleShare}
                  className="flex items-center text-gray-600 hover:text-green-500 transition-colors"
                  aria-label="Share this post"
                >
                  <FaShareAlt className="mr-1" />
                </button>

                {isShareMenuOpen && (
                  <ShareMenu
                    shareUrl={shareUrl}
                    title={post.title}
                    onClose={() => setShareMenuOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Comments Popup */}
          <CommentsPopup
            isOpen={isCommentsOpen}
            onClose={closeCommentPopup}
            postId={post.id}
            user={user}
          />
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/3 mt-4 md:mt-0">
          {post.image_title && (
            <div className="p-4">
              <Link href={`/p/${post.title_name}`}>
                <img
                  src={post.image_title}
                  alt={post.title}
                  className="h-48 w-full object-cover rounded transform hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostItem;
