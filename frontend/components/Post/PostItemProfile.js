// components/Post/PostItemProfile.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { FaHandsClapping, FaRegComments } from "react-icons/fa6";
import CommentsPopup from '../Comment/CommentsPopup';
import Rating from './Rating';
import TextUtils from '../Utils/TextUtils';

import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import TimeAgo from '../Utils/TimeAgo';
import { useRouter } from 'next/router';
import { deletePost } from '../../services/postService'; // Hàm API xóa bài viết
import { FaComment } from 'react-icons/fa';

const PostItemProfile = ({ post, isOwner }) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }

  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);

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
    if (clapLoading) return;
    
    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };



  // Hàm xử lý xóa bài viết
  const handleDelete = async () => {
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa bài viết này không?');
    if (!confirmDelete) return;

    try {
      await deletePost(post.id);
      alert('Bài viết đã được xóa thành công!');
      router.reload(); // Reload trang để cập nhật danh sách bài viết
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Đã xảy ra lỗi khi xóa bài viết. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="rounded-lg mb-6 bg-white transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Post Section */}
        <div className="w-full md:w-2/3 pr-0 md:pr-4">


          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className="block">
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
                <FaHandsClapping className="mr-1" /> {currentClapCount}
              </button>

              {/* Nút Comment */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
                aria-label="View comments"
              >
                <FaComment className="mr-1" /> {post.comments_count || 0}
              </button>

              {/* Số lượng View */}
              <span className="flex items-center text-gray-600">
                <FaEye className="mr-1" /> {post.views}
              </span>
              <TimeAgo timestamp={post.created_at} />
            </div>

            <div className="flex items-center space-x-4">
              {/* Nút Edit và Delete - Chỉ hiển thị nếu là chủ sở hữu */}
              {isOwner && (
                <>
                  <Link href={`/edit/${post.title_name}`} className="flex items-center text-gray-600 hover:text-blue-500 transition-colors" aria-label="Edit post">
                    <FaEdit className="mr-1" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                    aria-label="Delete post"
                  >
                    <FaTrash className="mr-1" />
                  </button>
                </>
              )}
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
              <Link href={`/p/${post.title_name}`} className="block">
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

export default PostItemProfile;
