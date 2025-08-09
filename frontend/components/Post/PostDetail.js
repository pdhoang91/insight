// components/Post/PostDetail.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaRegComments } from "react-icons/fa6";
import { FaEye, FaShareAlt, FaRegBookmark, FaBookmark, FaCommentDots, FaComment } from 'react-icons/fa';

import CommentsPopup from '../Comment/CommentsPopup';
import Rating from './Rating';
import AuthorInfo from '../Auth/AuthorInfo';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import useBookmark from '../../hooks/useBookmark';
import { useComments } from '../../hooks/useComments';
import { BASE_FE_URL } from '../../config/api';

export const PostDetail = ({ post }) => {
  if (!post) {
    return <div className="flex justify-center items-center h-64 text-gray-300 font-mono">// Loading post...</div>;
  }
  const { clapsCount: postClapsCount, loading: postLoading, hasClapped: hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);

//  const { clapsCount: postClapsCount, loading: postLoading, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { isBookmarked, toggleBookmark, loading: isBookmarkLoading } = useBookmark(post.id);
  const [isCommentsOpen, setCommentsOpen] = React.useState(false);
  const { comments, totalCount, totalCommentReply, isLoading, isError, mutate: mutateComments } = useComments(post.id, true, 1, 10);

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

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  const shareUrl = `${BASE_FE_URL}/p/${post.title_name}`;

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
    <div className="flex flex-col p-8 bg-surface text-primary">
      {/* Image Section */}
      {/* {post.categories?.length > 0 && (
        <img
          src={
            typeof post.categories[0] === 'string'
              ? post.categories[0]
              : post.categories[0].url
          }
          alt={post.title}
          className="w-full h-64 sm:h-80 md:h-96 object-cover rounded mb-4"
        />
      )} */}

      {/* Header Section - Technical Style */}
      <header className="mb-8 pb-6 border-b border-border-primary">
        <h1 className="text-4xl font-bold text-primary mb-4 line-height-tight">{post.title}</h1>
        
        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-secondary">
          <div className="flex items-center space-x-4">
            {post.user && <AuthorInfo author={post.user} />}
            <span className="font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-mono text-xs text-muted">
            <span>{post.views} views</span>
            <span>~{Math.ceil(post.content?.replace(/<[^>]*>/g, '').length / 200) || 1} min read</span>
          </div>
        </div>
      </header>

      {/* Interaction Section - Technical Style */}
      <div className="flex flex-wrap items-center text-secondary mb-8 pb-4 border-t border-border-primary pt-4 space-x-6">
        {/* Claps */}
        <button
          onClick={handleClap}
          className={`flex items-center font-mono ${
            hasClapped ? 'text-primary' : 'text-secondary hover:text-primary'
          } transition-colors`}
        >
          <FaHandsClapping className="mr-1" /> {postClapsCount} claps
        </button>

        {/* Comments */}
        <button onClick={toggleCommentPopup} className="flex items-center text-secondary hover:text-primary transition-colors font-mono">
          <FaComment className="mr-1" /> {totalCommentReply} comments
        </button>

        {/* Bookmark */}
        <button onClick={toggleBookmark} className="flex items-center text-secondary hover:text-primary transition-colors font-mono" disabled={isBookmarkLoading}>
          {isBookmarked ? (
            <FaBookmark className="mr-1 text-primary" />
          ) : (
            <FaRegBookmark className="mr-1" />
          )}
          {isBookmarked ? 'saved' : 'save'}
          {isBookmarkLoading && <span className="ml-1 text-sm">...</span>}
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex items-center text-secondary hover:text-primary transition-colors font-mono">
          <FaShareAlt className="mr-1" /> share
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-8">
        {/* Featured Image */}
        <img
          src={post.image_title}
          alt={post.title}
          className="w-full h-64 object-cover mb-8"
        />
        
        {/* Content Area - Clean & Simple */}
        <div className="post-content text-primary leading-relaxed max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }} 
            className="prose-content"
          />
        </div>
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
        comments={comments}
      />
    </div>
  );
};

export default PostDetail;
