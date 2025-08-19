// components/Post/PostDetail.js
import React from 'react';
import { FaComment, FaEye } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';

// Simplified PostDetail component - now just renders post content
// Main logic moved to /p/[id] page
export const PostDetail = ({ 
  post, 
  currentClapCount, 
  clapLoading, 
  onClap, 
  onScrollToComments
}) => {
  return (
    <div className="py-4 sm:py-6 lg:py-8">
      <article className="rounded-lg max-w-4xl mx-auto">
          {/* Header Section */}
          <header>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3 sm:mb-4 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 text-sm text-text-secondary">
              {/* Left side - Action buttons grouped together */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Claps */}
                <button
                  onClick={onClap}
                  disabled={clapLoading}
                  className="flex items-center gap-1.5 sm:gap-2 text-text-muted hover:text-hacker-yellow transition-colors disabled:opacity-50 text-sm"
                >
                  <FaHandsClapping className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${clapLoading ? 'animate-pulse' : ''}`} /> 
                  <span>{currentClapCount}</span>
                </button>

                {/* Comments */}
                <button 
                  onClick={onScrollToComments} 
                  className="flex items-center gap-1.5 sm:gap-2 text-text-muted hover:text-matrix-green transition-colors text-sm"
                >
                  <FaComment className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                  <span>{post.comments_count || 0}</span>
                </button>

                {/* Views */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted text-sm">
                  <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{post.views || 0}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image - Cover Style */}
          {post.image_title && (
            <div className="relative w-full py-3 sm:py-4 h-32 sm:h-40 md:h-52 lg:h-64 overflow-hidden">
              <img
                src={post.image_title}
                alt={post.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="mt-4 sm:mt-6">
            {/* Content */}
            <div 
              className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none text-text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>


      </article>
    </div>
  );
};

export default PostDetail;
