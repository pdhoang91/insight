// components/Post/PostDetail.js
import React, { useRef, useState } from 'react';
import { FaComment, FaEye } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import CommentSection from '../Comment/CommentSection';

export const PostDetail = ({ post }) => {
  const commentSectionRef = useRef(null);
  const { user } = useUser();
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);

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
    <div className="min-h-screen bg-terminal-black">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="bg-terminal-gray rounded-lg border border-matrix-green/30">
            {/* Header Section */}
            <header className="p-6 md:p-8 border-b border-matrix-green/20">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
                {post.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-text-secondary">
                {/* Left side - Action buttons grouped together */}
                <div className="flex items-center gap-6">
                  {/* Claps */}
                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center gap-2 text-text-muted hover:text-hacker-yellow transition-colors disabled:opacity-50"
                  >
                    <FaHandsClapping className={`w-4 h-4 ${clapLoading ? 'animate-pulse' : ''}`} /> 
                    <span>{currentClapCount}</span>
                  </button>

                  {/* Comments */}
                  <button 
                    onClick={scrollToComments} 
                    className="flex items-center gap-2 text-text-muted hover:text-matrix-green transition-colors"
                  >
                    <FaComment className="w-4 h-4" /> 
                    <span>{post.comments_count || 0}</span>
                  </button>

                  {/* Views */}
                  <div className="flex items-center gap-2 text-text-muted">
                    <FaEye className="w-4 h-4" />
                    <span>{post.views || 0}</span>
                  </div>
                </div>

                {/* Right side - Date and reading time */}
                <div className="flex items-center gap-4">
                  <span>Published on {new Date(post.created_at).toLocaleDateString()}</span>
                  <span>~{Math.ceil(post.content?.replace(/<[^>]*>/g, '').length / 200) || 1} min read</span>
                </div>
              </div>
            </header>

            {/* Featured Image - Cover Style */}
            {post.image_title && (
              <div className="relative w-full h-40 md:h-52 lg:h-64 overflow-hidden">
                <img
                  src={post.image_title}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Post Content */}
            <div className="p-6 md:p-8">
              {/* Content */}
              <div 
                className="prose prose-invert max-w-none text-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Comments Section */}
            <div className="p-6 md:p-8 border-t border-matrix-green/20" ref={commentSectionRef}>
              <CommentSection postId={post.id} user={user} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
