// components/Post/PostItemProfile.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { FaHandsClapping, FaRegComments } from "react-icons/fa6";
// import CommentsPopup from '../Comment/CommentsPopup'; // Removed - using inline comments
import Rating from './Rating';
import TextUtils from '../Utils/TextUtils';
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import TimeAgo from '../Utils/TimeAgo';
import { BASE_FE_URL } from '../../config/api';
import { useRouter } from 'next/router';
import { deletePost } from '../../services/postService'; // Hàm API xóa bài viết
import { FaComment } from 'react-icons/fa';

const PostItemProfile = ({ post, isOwner }) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }

  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const router = useRouter();

  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, true, 1, 10);


  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }
    try {
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
    <div className="rounded-card mb-6 bg-medium-bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex flex-col md:flex-row">
        {/* Post Section */}
        <div className="w-full md:w-2/3 pr-0 md:pr-4">

          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className="block">
            <h5 className="text-heading-3 text-medium-text-primary hover:text-medium-accent-green transition-colors duration-200 line-clamp-2">
              {post.title}
            </h5>
          </Link>

          {/* Post Preview Content */}
          <p className="text-medium-text-secondary text-body-small line-clamp-2">
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
                className="flex items-center text-medium-text-secondary hover:text-medium-accent-green transition-colors"
                aria-label="Clap for this post"
              >
                <FaHandsClapping className="mr-1" /> {clapsCount}
              </button>

              {/* Nút Comment */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center text-medium-text-secondary hover:text-medium-accent-green transition-colors"
                aria-label="View comments"
              >
                <FaComment className="mr-1" /> {totalCommentReply}
              </button>

              {/* Số lượng View */}
              <span className="flex items-center text-medium-text-muted">
                <FaEye className="mr-1" /> {post.views}
              </span>
              <TimeAgo timestamp={post.created_at} />
            </div>

            <div className="flex items-center space-x-4">
              {/* Nút Edit và Delete - Chỉ hiển thị nếu là chủ sở hữu */}
              {isOwner && (
                <>
                  <Link href={`/edit/${post.title_name}`} className="flex items-center text-medium-text-secondary hover:text-medium-accent-green transition-colors" aria-label="Edit post">
                    <FaEdit className="mr-1" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center text-medium-text-secondary hover:text-error transition-colors"
                    aria-label="Delete post"
                  >
                    <FaTrash className="mr-1" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Comments Popup */}
          {/* Comments feature temporarily disabled */}
          {isCommentsOpen && (
            <div className="mt-4 p-6 bg-medium-bg-secondary rounded-card">
              <p className="text-medium-text-muted">Comments feature coming soon...</p>
            </div>
          )}
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
