// components/Post/PostDetail.js
import React, { useRef, useState } from 'react';
import { FaComment, FaEye } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import CommentSection from '../Comment/CommentSection';
import Rating from './Rating';

export const PostDetail = ({ post }) => {
  const commentSectionRef = useRef(null);
  const { user } = useUser();
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);

  const { comments, totalCommentReply, totalCount, isLoading, isError, mutate } = useComments(post.id, true, 1, 10);

  const handleClap = async () => {
    if (!user) {
      alert('You need to login to clap.');
      return;
    }
    if (clapLoading) return;

    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('An error occurred while clapping. Please try again.');
    } finally {
      setClapLoading(false);
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
      {/* Header Section - Technical Style */}
      <header className="mb-8 pb-6 border-b border-border-primary">
        <h1 className="text-4xl font-bold text-primary mb-4 line-height-tight">{post.title}</h1>
        
        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-secondary">
          <div className="flex items-center space-x-4">
            <span className="font-mono">Published on {new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-mono text-xs text-muted">
            <div className="flex items-center gap-1">
              <FaEye className="w-3 h-3" />
              <span>{post.views || 0} views</span>
            </div>
            <span>~{Math.ceil(post.content?.replace(/<[^>]*>/g, '').length / 200) || 1} min read</span>
          </div>
        </div>
      </header>

      {/* Interaction Section - Technical Style */}
      <div className="flex flex-wrap items-center text-secondary mb-8 pb-4 border-border-primary pt-4 space-x-6">
        {/* Claps */}
        <button
          onClick={handleClap}
          disabled={clapLoading}
          className="flex items-center text-secondary hover:text-primary transition-colors font-mono"
        >
          <FaHandsClapping className="mr-2 w-4 h-4" /> 
          <span>{currentClapCount} claps</span>
        </button>

        {/* Comments */}
        <button 
          onClick={scrollToComments} 
          className="flex items-center text-secondary hover:text-primary transition-colors font-mono"
        >
          <FaComment className="mr-2 w-4 h-4" /> 
          <span>{post.comments_count || 0} comments</span>
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-8">
        {/* Featured Image */}
        <img
          src={post.image_title}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none text-primary" 
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Rating Section */}
      <div className="mb-8">
        <Rating postId={post.id} />
      </div>

      {/* Comments Section */}
      <div ref={commentSectionRef}>
        <CommentSection
          postId={post.id}
          comments={comments}
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          mutate={mutate}
        />
      </div>
    </div>
  );
};

export default PostDetail;
