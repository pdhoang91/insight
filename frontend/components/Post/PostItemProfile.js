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
    <div className="rounded-card px-6 py-8 mb-8 bg-medium-bg-card border border-medium-border shadow-card hover:shadow-card-hover hover:border-medium-accent-green/20 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Post Section */}
        <div className="flex-1 min-w-0">

          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className="block mb-4">
            <h5 className="text-heading-3 font-serif text-medium-text-primary hover:text-medium-accent-green transition-colors duration-200 line-clamp-2 leading-tight">
              {post.title}
            </h5>
          </Link>

          {/* Post Preview Content */}
          <div className="mb-6">
            <p className="text-body text-medium-text-secondary line-clamp-3 leading-relaxed">
              <TextUtils html={post.preview_content} maxLength={280} />
            </p>
          </div>

          {/* Rating Component */}
          <div className="mb-6">
            <Rating postId={post.id} />
          </div>

          {/* Interaction Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side - Meta info */}
            <div className="flex items-center space-x-4 text-sm">
              <TimeAgo timestamp={post.created_at} className="text-medium-text-muted" />
              <span className="w-1 h-1 bg-medium-text-muted rounded-full"></span>
              <span className="text-medium-text-muted">
                {Math.ceil((post.preview_content?.length || 0) / 200)} min read
              </span>
            </div>

            {/* Right side - Interaction buttons */}
            <div className="flex items-center space-x-6">
              {/* Nút Clap */}
              <button
                onClick={handleClap}
                className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-accent-green transition-colors group"
                aria-label="Clap for this post"
              >
                <FaHandsClapping className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{clapsCount}</span>
              </button>

              {/* Nút Comment */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-accent-green transition-colors group"
                aria-label="View comments"
              >
                <FaComment className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{totalCommentReply}</span>
              </button>

              {/* Số lượng View */}
              <div className="flex items-center space-x-2 text-medium-text-muted">
                <FaEye className="w-4 h-4" />
                <span className="font-medium">{post.views || 0}</span>
              </div>

              {/* Action buttons for owner */}
              {isOwner && (
                <div className="flex items-center space-x-4">
                  <Link href={`/edit/${post.title_name}`} className="flex items-center space-x-1 text-medium-text-secondary hover:text-medium-accent-green transition-colors" aria-label="Edit post">
                    <FaEdit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-1 text-medium-text-secondary hover:text-error transition-colors"
                    aria-label="Delete post"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments Popup */}
          {isCommentsOpen && (
            <div className="mt-8 pt-6 border-t border-medium-border">
              <p className="text-medium-text-muted">Comments feature coming soon...</p>
            </div>
          )}
        </div>

        {/* Image Section */}
        {post.image_title && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <Link href={`/p/${post.title_name}`} className="block">
              <div className="relative overflow-hidden rounded-medium bg-medium-bg-secondary">
                <img
                  src={post.image_title}
                  alt={post.title}
                  className="w-full h-48 lg:h-40 object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItemProfile;
