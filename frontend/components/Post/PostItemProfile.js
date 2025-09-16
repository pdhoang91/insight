// components/Post/PostItemProfile.js
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { FaHandsClapping, FaRegComments } from "react-icons/fa6";
// import CommentsPopup from '../Comment/CommentsPopup'; // Removed - using inline comments
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
import AddCommentForm from '../Comment/AddCommentForm';
import LimitedCommentList from '../Comment/LimitedCommentList';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const PostItemProfile = ({ post, isOwner }) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }

  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const router = useRouter();

  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, true, 1, 10);
  const canLoadMore = false;
  const loadMore = () => {};


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
    <article className="group relative bg-medium-bg-card rounded-xl mb-8 transition-all duration-300">
      <div className={`${themeClasses.responsive.flexDesktopRow} ${themeClasses.spacing.gap} items-start`}>
        {/* Image Section - First on mobile, second on desktop */}
        {post.image_title && (
          <div className="w-full md:w-64 lg:w-80 flex-shrink-0 order-1 md:order-2">
            <Link href={`/p/${post.title_name}`} className="block">
              <div className="relative overflow-hidden rounded-xl bg-medium-bg-secondary">
                <div className="aspect-[16/10]">
                  <img
                    src={post.image_title}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Main Content Section - Second on mobile, first on desktop */}
        <div className="flex-1 min-w-0 order-2 md:order-1 py-6">

          {/* Post Title */}
          <Link href={`/p/${post.title_name}`} className={`block ${themeClasses.spacing.marginBottom}`}>
            <h2 className="text-xl lg:text-2xl font-bold text-medium-text-primary mb-3 line-clamp-2 text-balance group-hover:text-medium-accent-green transition-colors duration-300">
              {post.title}
            </h2>
          </Link>

          {/* Post Preview Content */}
          <div className="mb-6">
            <p className="text-medium-text-secondary line-clamp-3 leading-relaxed text-base lg:text-lg">
              <TextUtils html={post.preview_content} maxLength={280} />
            </p>
          </div>


          {/* Meta Information & Actions - Hidden by default, show on hover */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Left side - Meta info */}
            <div className="flex items-center gap-4 text-body-small">
              <TimeAgo timestamp={post.created_at} className="text-medium-text-muted" />
              <span className="w-1 h-1 bg-medium-text-muted rounded-full"></span>
              <span className="text-medium-text-muted">
                {Math.ceil((post.preview_content?.length || 0) / 200)} min read
              </span>
            </div>

            {/* Right side - Interaction buttons */}
            <div className="flex items-center gap-6">
              {/* Clap Button */}
              <button
                onClick={handleClap}
                disabled={clapsLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-medium-hover text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 min-h-[44px]"
                aria-label={`Clap for this post. Current claps: ${clapsCount}`}
              >
                <FaHandsClapping className="w-4 h-4" />
                <span className="font-medium text-sm">{clapsCount}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={toggleCommentPopup}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-medium-hover text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 min-h-[44px]"
                aria-label={`View comments. ${totalCommentReply || 0} comments`}
              >
                <FaComment className="w-4 h-4" />
                <span className="font-medium text-sm">{totalCommentReply || 0}</span>
              </button>

              {/* View Count */}
              <div className="flex items-center gap-2 text-medium-text-muted">
                <FaEye className="w-4 h-4" />
                <span className="font-medium text-sm">{post.views || 0}</span>
              </div>

              {/* Action buttons for owner */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/edit/${post.title_name}`} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-medium-hover text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 min-h-[44px]"
                    aria-label="Chỉnh sửa bài viết"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span className="font-medium text-sm">Edit</span>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-50 text-medium-text-secondary hover:text-red-600 transition-all duration-200 min-h-[44px]"
                    aria-label="Xóa bài viết"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span className="font-medium text-sm">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Comments Section - Full Width */}
      {isCommentsOpen && (
        <div className="mt-8 pt-6 px-6">
          <div className="space-y-6">
            <AddCommentForm 
              postId={post.id} 
              user={user} 
              onCommentAdded={mutate}
            />
            <LimitedCommentList
              comments={comments ? comments.flat() : []}
              postId={post.id}
              mutate={mutate}
              canLoadMore={false}
              loadMore={() => {}}
              isLoadingMore={isLoading}
              totalCount={totalCount || 0}
            />
          </div>
        </div>
      )}
    </article>
  );
};

export default PostItemProfile;
