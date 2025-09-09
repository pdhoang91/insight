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
    <article>
      {/* Title Section */}
      <header className="mb-8">
        <h1 className="text-article-title font-serif font-bold text-medium-text-primary mb-4 leading-tight text-balance">
          {post.title}
        </h1>

        {/* Post Meta Information */}
        <div className="flex items-center space-x-4 text-body-small text-medium-text-muted">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span className="w-1 h-1 bg-medium-text-muted rounded-full"></span>
          <span>{Math.ceil((post.content?.length || 0) / 1000)} min read</span>
        </div>
      </header>

      {/* Featured Image */}
      {post.image_title && (
        <div className="mb-8">
          <img
            src={post.image_title}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover rounded-lg shadow-card"
            loading="eager"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div
          className="post-content reading-content text-body text-medium-text-primary leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Interaction Section */}
      <footer className="border-t border-medium-border pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Claps */}
            <button
              onClick={handleClap}
              className={`flex items-center space-x-2 transition-all duration-200 group ${
                hasClapped 
                  ? 'text-medium-accent-green' 
                  : 'text-medium-text-secondary hover:text-medium-accent-green'
              }`}
              aria-label="Clap for this post"
            >
              <FaHandsClapping className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-body-small">{postClapsCount}</span>
            </button>

            {/* Comments */}
            <button 
              onClick={toggleCommentPopup} 
              className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-accent-green transition-all duration-200 group"
              aria-label="View comments"
            >
              <FaComment className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-body-small">{totalCommentReply || 0}</span>
            </button>
          </div>

          {/* Views */}
          <div className="flex items-center space-x-2 text-medium-text-muted">
            <FaEye className="w-4 h-4" />
            <span className="font-medium text-body-small">{post.views || 0}</span>
          </div>
        </div>
      </footer>

      {/* Rating */}
      <div className="mt-6">
        <Rating postId={post.id} userId={user ? user.id : null} />
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="mt-8 p-4 bg-medium-bg-secondary rounded-lg">
          <p className="text-medium-text-muted text-body-small">Comments feature coming soon...</p>
        </div>
      )}
    </article>
  );
};

export default PostDetail;