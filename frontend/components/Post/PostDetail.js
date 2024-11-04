// components/Post/PostDetail.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaRegComments } from "react-icons/fa6";
import { FaEye, FaShareAlt, FaRegBookmark, FaBookmark, FaCommentDots } from 'react-icons/fa';
import CommentsPopup from '../Comment/CommentsPopup';
import Rating from './Rating';
import AuthorInfo from '../Auth/AuthorInfo';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import useBookmark from '../../hooks/useBookmark';
import {useComments} from '../../hooks/useComments'; // Import useComments hook

const PostDetail = ({ post }) => {
  // Kiểm tra xem post có tồn tại không
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }

  const { clapsCount: postClapsCount, loading: postLoading, hasClapped: hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);

  const { user } = useUser();
  
  // Sử dụng hook useBookmark
  const { isBookmarked, toggleBookmark, loading: isBookmarkLoading } = useBookmark(post.id);
  
  const [isCommentsOpen, setCommentsOpen] = React.useState(false);
  
  // Sử dụng hook useComments để lấy danh sách comments
  const { comments, totalCount, totalCommentReply, isLoading, isError, mutate: mutateComments } = useComments(post.id, true, 1, 10);

  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }

    try {
      await clapPost(post.id);
      mutateClaps(); // Refetch clap count
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  const shareUrl = `http://localhost:3000/post/${post.title_name}`;
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: shareUrl,
      });
    } else {
      alert('Trình duyệt của bạn không hỗ trợ chia sẻ.');
    }
  };

  return (
    <div className="p-4 mb-4 flex flex-col">
      {/* Image Section */}
      {post.categories?.length > 0 && (
        <img
          src={
            typeof post.categories[0] === 'string'
              ? post.categories[0]
              : post.categories[0].url
          }
          alt={post.title}
          className="h-40 w-full center-parent object-cover rounded mb-4"
        />
      )}

      {/* Title Section */}
      <h1 className="text-4xl font-bold mb-2 text-gray-800">{post.title}</h1>

      {/* Author and Meta Information */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        {/* Thông tin tác giả */}
        {post.user && <AuthorInfo author={post.user} />}
        {/* Ngày đăng */}
        <span className="ml-2">{new Date(post.created_at).toLocaleDateString()}</span>
      </div>

      {/* Interaction Section */}
      <div className="flex items-center text-gray-600 mb-4 space-x-4">
        {/* Claps */}
        <button
          onClick={handleClap}
          className={`flex items-center ${
            hasClapped ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <FaHandsClapping className="mr-1" /> {postClapsCount}
        </button>

        {/* Comments */}
        <button onClick={toggleCommentPopup} className="flex items-center">
          <FaRegComments className="mr-1" /> {totalCommentReply}
        </button>

        {/* Views */}
        <div className="flex items-center">
          <FaEye className="mr-1" /> {post.views}
        </div>

        {/* Bookmark */}
        <button onClick={toggleBookmark} className="flex items-center" disabled={isBookmarkLoading}>
          {isBookmarked ? (
            <FaBookmark className="mr-1 text-yellow-500" />
          ) : (
            <FaRegBookmark className="mr-1" />
          )}
          {isBookmarkLoading && <span className="ml-1 text-sm">...</span>}
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex items-center">
          <FaShareAlt className="mr-1" />
        </button>
      </div>

      {/* Post Content */}
      <div className="prose max-w-none mb-8">
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Rating */}
      <div className="mt-6">
        <Rating postId={post.id} userId={user ? user.id : null} />
      </div>

      {/* Comments Popup */}
      <CommentsPopup
        isOpen={isCommentsOpen}
        onClose={closeCommentPopup}
        postId={post.id}
        user={user}
        comments={comments} // Truyền danh sách comments nếu cần
      />
    </div>
  );
};

export default PostDetail;

