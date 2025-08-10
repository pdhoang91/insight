// components/Post/PostDetail.js
import React, { useRef } from 'react';
import { FaComment } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import CommentSection from '../Comment/CommentSection';
import Rating from './Rating';

export const PostDetail = ({ post }) => {
  const commentSectionRef = useRef(null);
  const { clapsCount, loading: clapsLoading, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const [postClapsCount, setPostClapsCount] = React.useState(clapsCount);
  const [hasClapped, setHasClapped] = React.useState(false);

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
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };

  const scrollToComments = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
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
            <span className="font-mono">Published on {new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-mono text-xs text-muted">
            <span>{post.views} views</span>
            <span>~{Math.ceil(post.content?.replace(/<[^>]*>/g, '').length / 200) || 1} min read</span>
          </div>
        </div>
      </header>

      {/* Interaction Section - Technical Style */}
      <div className="flex flex-wrap items-center text-secondary mb-8 pb-4 border-border-primary pt-4 space-x-6">
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
        <button onClick={scrollToComments} className="flex items-center text-secondary hover:text-primary transition-colors font-mono">
          <FaComment className="mr-1" /> {totalCommentReply} comments
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

      {/* Comments Section */}
      <div ref={commentSectionRef}>
        <CommentSection postId={post.id} user={user} />
      </div>
    </div>
  );
};

export default PostDetail;
