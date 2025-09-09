// components/Post/PostDetail.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping } from "react-icons/fa6";
import { FaEye, FaComment } from 'react-icons/fa';
import Rating from './Rating';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';

export const PostDetail = ({ post }) => {
  if (!post) {
    return <div className="flex justify-center items-center h-64 text-medium-text-muted">Đang tải bài viết...</div>;
  }

  const { clapsCount: postClapsCount, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = React.useState(false);
  const { totalCommentReply } = useComments(post.id, true, 1, 10);

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
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col">
      {/* Title Section */}
      <h1 className="text-article-title font-serif text-medium-text-primary mb-6">{post.title}</h1>

      {/* Post Meta Information */}
      <div className="flex items-center text-body-small text-medium-text-secondary mb-4">
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>

      {/* Interaction Section */}
      <div className="flex flex-wrap items-center text-medium-text-secondary mb-6 space-x-4">
        {/* Claps */}
        <button
          onClick={handleClap}
          className={`flex items-center ${
            hasClapped ? 'text-medium-accent-green' : 'text-medium-text-secondary hover:text-medium-accent-green'
          } transition-colors`}
        >
          <FaHandsClapping className="mr-1" /> {postClapsCount}
        </button>

        {/* Comments */}
        <button 
          onClick={toggleCommentPopup} 
          className="flex items-center text-medium-text-secondary hover:text-medium-accent-green transition-colors"
        >
          <FaComment className="mr-1" /> {totalCommentReply}
        </button>

        {/* Views */}
        <div className="flex items-center">
          <FaEye className="mr-1" /> {post.views}
        </div>
      </div>

      {/* Post Content */}
      <div className="prose lg:prose-xl max-w-none mb-8">
        {post.image_title && (
          <img
            src={post.image_title}
            alt={post.title}
            className="h-48 w-full object-cover rounded-card transform hover:scale-105 transition-transform duration-300"
          />
        )}
        <div
          className="post-content reading-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Rating */}
      <div className="mt-6">
        <Rating postId={post.id} userId={user ? user.id : null} />
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="mt-4 p-4 bg-medium-bg-secondary rounded-card">
          <p className="text-medium-text-muted">Comments feature coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default PostDetail;