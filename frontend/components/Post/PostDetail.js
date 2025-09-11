// components/Post/PostDetail.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping } from "react-icons/fa6";
import { FaEye, FaComment } from 'react-icons/fa';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';

export const PostDetail = ({ post, onScrollToComments }) => {
  if (!post) {
    return <div className="flex justify-center items-center h-64 text-medium-text-muted">Đang tải bài viết...</div>;
  }

  const { clapsCount: postClapsCount, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
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


  return (
    <article>
      {/* Title Section */}
      <header className="mb-8">
        <h1 className="font-serif font-bold text-medium-text-primary mb-4 leading-tight text-balance text-lg md:text-xl lg:text-2xl">
          {post.title}
        </h1>

        {/* Post Meta Information */}
        <div className="flex items-center justify-between">
          {/* Date and Reading Time */}
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

          {/* Interaction Icons */}
          <div className="flex items-center space-x-6">
            {/* Claps */}
            <button
              onClick={handleClap}
              className={`flex items-center space-x-2 transition-all duration-200 group ${
                hasClapped 
                  ? 'text-medium-accent-green' 
                  : 'text-medium-text-secondary hover:text-medium-text-primary'
              }`}
              aria-label="Clap for this post"
            >
              <FaHandsClapping className="w-4 h-4" />
              <span className="font-medium text-body-small">{postClapsCount}</span>
            </button>

            {/* Comments */}
            <button 
              onClick={onScrollToComments}
              className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-text-primary transition-colors duration-200 group"
              aria-label="Go to comments"
            >
              <FaComment className="w-4 h-4" />
              <span className="font-medium text-body-small">{totalCommentReply || 0}</span>
            </button>

            {/* Views */}
            <div className="flex items-center space-x-2 text-medium-text-muted">
              <FaEye className="w-4 h-4" />
              <span className="font-medium text-body-small">{post.views || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.image_title && (
        <div className="mb-8">
          <img
            src={post.image_title}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover rounded-lg border border-medium-border"
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



    </article>
  );
};

export default PostDetail;