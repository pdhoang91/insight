// components/Post/PostItemTimeline.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaComment, FaEye, FaTerminal, FaCode, FaClock } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { SiReact, SiJavascript, SiPython, SiDocker } from 'react-icons/si';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import AddCommentForm from '../Comment/AddCommentForm';
import CommentItem from '../Comment/CommentItem';
import { addComment } from '../../services/commentService';
import TextUtils from '../Utils/TextUtils';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

const PostItemTimeline = ({ post }) => {
  if (!post) {
    return (
      <div className="terminal-window animate-pulse">
        <div className="terminal-header">
          <span>loading@timeline</span>
        </div>
        <div className="p-6 bg-terminal-dark">
          <div className="text-text-muted font-mono">Loading post...</div>
        </div>
      </div>
    );
  }

  const { user } = useUser();
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);
  
  // Get comments data with infinite loading
  const { 
    comments, 
    totalCount, 
    isLoading, 
    isError, 
    canLoadMore,
    loadMore,
    mutate 
  } = useInfiniteComments(post.id, isCommentsOpen, 2);

  // Get tech icon based on content
  const getTechIcon = () => {
    const content = (post.title + ' ' + post.preview_content).toLowerCase();
    if (content.includes('react')) return SiReact;
    if (content.includes('python')) return SiPython;
    if (content.includes('javascript') || content.includes('js')) return SiJavascript;
    if (content.includes('docker')) return SiDocker;
    return FaCode;
  };

  const TechIcon = getTechIcon();

  const handleClap = async () => {
    if (!user) {
      alert('Authentication required: Please login to clap.');
      return;
    }
    if (clapLoading) return;
    
    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Error: Unable to process clap request.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => setCommentsOpen((prev) => !prev);

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Authentication required: Please login to comment.');
      return;
    }
    if (!content.trim()) {
      alert('Error: Comment content cannot be empty.');
      return;
    }
    try {
      await addComment(post.id, content);
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Error: Failed to add comment. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <article className="terminal-window hover:shadow-neon-green/20 transition-all duration-300 mb-6">
        {/* Terminal Header */}
        <div className="terminal-header">
          <TechIcon className="w-3 h-3 text-matrix-cyan mr-2" />
          <span>post@{post.id}</span>
          <div className="ml-auto text-text-muted text-xs">
            Modified: <TimeAgo timestamp={post.created_at} />
          </div>
        </div>

        <div className="bg-terminal-dark">
          <div className="flex p-6">
            {/* Left Side - Content (2/3) */}
            <div className="flex-1 pr-6">
              {/* Title - Terminal Command Style */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-xl md:text-2xl font-bold text-text-primary hover:text-matrix-green transition-colors duration-300 line-clamp-2 mb-4 font-mono">
                  <span className="text-hacker-yellow">$</span> cat "{post.title}"
                </h2>
              </Link>

              {/* Content Preview - Code Comment Style */}
              <div className="text-text-secondary text-sm md:text-base line-clamp-3 mb-4 font-mono leading-relaxed">
                <span className="text-text-muted">//</span> <TextUtils html={post.preview_content} maxLength={200} />
              </div>

              {/* Categories - Terminal Directory Style */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.categories && post.categories.slice(0, 2).map((category, index) => (
                  <Link
                    key={index}
                    href={`/category/${(category.name || category).toLowerCase()}`}
                    className="px-3 py-1 bg-terminal-gray text-matrix-cyan rounded border border-matrix-green/30 text-xs font-mono hover:bg-terminal-light hover:border-matrix-green transition-all duration-300"
                  >
                    ./{category.name || category}
                  </Link>
                ))}
              </div>

              {/* Action Icons - Terminal Status Bar Style */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Claps */}
                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center gap-1 text-text-muted hover:text-hacker-yellow transition-colors hover:scale-110"
                  >
                    <FaHandsClapping className={`w-4 h-4 ${clapLoading ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-mono">{currentClapCount}</span>
                  </button>

                  {/* Comments */}
                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center gap-1 text-text-muted hover:text-matrix-green transition-colors"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm font-mono">{post.comments_count || 0}</span>
                  </button>

                  {/* Views */}
                  <div className="flex items-center gap-1 text-text-muted">
                    <FaEye className="w-4 h-4" />
                    <span className="text-sm font-mono">{post.views || 0}</span>
                  </div>
                </div>

                {/* Time and Read Info */}
                <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-3 h-3" />
                    <TimeAgo timestamp={post.created_at} />
                  </div>
                  <span>•</span>
                  <span>~5 min read</span>
                </div>
              </div>
            </div>

            {/* Right Side - Image with Terminal Frame (1/3) */}
            {post.image_title && (
              <div className="w-1/3 flex items-end">
                <Link href={`/p/${post.title_name}`} className="w-full">
                  <div className="relative w-full h-32 md:h-40 lg:h-48">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300 rounded border border-matrix-green/50 hover:border-matrix-green hover:shadow-neon-green/30"
                      sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
                    />
                    {/* Terminal Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-terminal-black/20 pointer-events-none rounded"></div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Terminal Status Bar */}
          <div className="bg-terminal-light px-6 py-2 border-t border-matrix-green/30">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted">
                Size: {post.preview_content?.length || 0} chars | Type: article
              </span>
              <span className="text-matrix-green">
                Press ENTER to read full post
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section - Terminal Log Style */}
        {isCommentsOpen && (
          <div className="border-t border-matrix-green/30">
            {/* Comments Header */}
            <div className="bg-terminal-gray px-6 py-2 border-b border-matrix-green/30">
              <div className="flex items-center space-x-2 text-sm font-mono text-matrix-green">
                <FaTerminal className="w-3 h-3" />
                <span>tail -f comments.log</span>
                <span className="ml-auto text-text-muted">
                  {totalCount || 0} entries
                </span>
              </div>
            </div>

            {/* Add Comment Form */}
            <div className="p-6 border-b border-matrix-green/30 bg-terminal-dark">
              {user ? (
                <AddCommentForm onAddComment={handleAddComment} />
              ) : (
                <div className="text-center py-4">
                  <span className="text-text-muted text-sm font-mono">
                    <span className="text-hacker-red">AUTH_REQUIRED:</span> Please login to comment
                  </span>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="p-6 bg-terminal-dark">
              {isError && (
                <div className="text-hacker-red text-sm font-mono text-center py-4">
                  <span className="text-hacker-red">ERROR:</span> Failed to load comments
                </div>
              )}
              
              {isLoading && comments.length === 0 && (
                <div className="flex justify-center items-center py-6">
                  <div className="w-4 h-4 border-2 border-matrix-green border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-text-secondary text-sm font-mono">Loading comments...</span>
                </div>
              )}

              {comments && comments.length > 0 && (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} mutate={mutate} />
                  ))}
                  
                  {canLoadMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm text-matrix-green hover:text-matrix-light-green font-mono border border-matrix-green/30 rounded hover:border-matrix-green transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Loading...' : `$ load --more (${totalCount - comments.length} remaining)`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !isError && comments.length === 0 && (
                <div className="text-center py-6">
                  <span className="text-text-muted text-sm font-mono">
                    <span className="text-hacker-yellow">INFO:</span> No comments found
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostItemTimeline; 