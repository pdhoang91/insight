// components/Post/PostItem.js
import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaComment, FaTerminal, FaCode, FaUser, FaClock } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { SiJavascript, SiReact, SiPython, SiDocker } from 'react-icons/si';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import CommentsPopup from '../Comment/CommentsPopup';
import TimeAgo from '../Utils/TimeAgo';
import TextUtils from '../Utils/TextUtils';
import SafeImage from '../Utils/SafeImage';

const PostItem = ({ post, variant = 'default' }) => {
  if (!post) {
    return (
      <div className="terminal-window animate-pulse">
        <div className="terminal-header">
          <span>loading@post</span>
        </div>
        <div className="p-4 bg-terminal-dark">
          <div className="text-text-muted font-mono">Loading post...</div>
        </div>
      </div>
    );
  }

  const { user } = useUser();
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(post.clap_count || 0);
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const { comments, totalCount, isLoading, isError, mutate } = useComments(post.id);

  const handleClap = async () => {
    if (!user) {
      alert('Authentication required: Please login to clap.');
      return;
    }

    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Clap error:', error);
      alert('Error: Unable to process clap request.');
    } finally {
      setClapLoading(false);
    }
  };

  const toggleCommentPopup = () => {
    setCommentsOpen((prev) => !prev);
  };

  const closeCommentPopup = () => {
    setCommentsOpen(false);
  };

  // Get tech icon based on content or categories
  const getTechIcon = () => {
    const content = (post.title + ' ' + post.preview_content).toLowerCase();
    if (content.includes('react')) return SiReact;
    if (content.includes('python')) return SiPython;
    if (content.includes('javascript') || content.includes('js')) return SiJavascript;
    if (content.includes('docker')) return SiDocker;
    return FaCode;
  };

  const TechIcon = getTechIcon();

  // Compact variant for smaller spaces
  if (variant === 'compact') {
    return (
      <>
        <article className="bg-terminal-gray rounded-lg border border-matrix-green/30 hover:border-matrix-green hover:shadow-neon-green/20 transition-all duration-300">
          {/* Terminal Header */}
          <div className="bg-terminal-light px-3 py-2 border-b border-matrix-green/30 rounded-t-lg">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-hacker-red rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-hacker-yellow rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-matrix-green rounded-full"></span>
                </span>
                <span className="text-matrix-green">post@{post.id}</span>
              </div>
              <TimeAgo timestamp={post.created_at} />
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-4">
              {/* Left Side - Content */}
              <div className="flex-1 min-w-0">
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-matrix-green/20 rounded border border-matrix-green/50 flex items-center justify-center flex-shrink-0">
                    <FaTerminal className="w-2 h-2 text-matrix-green" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-secondary min-w-0 font-mono">
                    <span className="text-matrix-green">$</span>
                    <span className="font-medium text-text-primary truncate">
                      {post.user?.name || 'anonymous'}
                    </span>
                    <span className="text-text-muted">@terminal</span>
                  </div>
                </div>

                {/* Title */}
                <Link href={`/p/${post.title_name}`}>
                  <h3 className="text-base font-semibold text-text-primary mb-2 hover:text-matrix-green transition-colors leading-tight line-clamp-2 font-mono">
                    <span className="text-hacker-yellow">&gt;</span> {post.title}
                  </h3>
                </Link>

                {/* Content Preview */}
                <div className="text-text-secondary text-sm mb-3 leading-relaxed font-mono">
                  <span className="text-text-muted">//</span> <TextUtils html={post.preview_content} maxLength={60} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-text-muted hover:text-matrix-cyan transition-colors">
                    <FaEye className="w-3 h-3" />
                    <span className="text-xs font-mono">{post.views || 0}</span>
                  </div>

                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center gap-1 text-text-muted hover:text-hacker-yellow transition-colors"
                  >
                    <FaHandsClapping className="w-3 h-3" />
                    <span className="text-xs font-mono">{currentClapCount}</span>
                  </button>

                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center gap-1 text-text-muted hover:text-matrix-green transition-colors"
                  >
                    <FaComment className="w-3 h-3" />
                    <span className="text-xs font-mono">{post.comments_count || 0}</span>
                  </button>
                </div>
              </div>

              {/* Right Side - Image */}
              {post.image_title && (
                <div className="w-20 h-20 flex-shrink-0">
                  <Link href={`/p/${post.title_name}`}>
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded border border-matrix-green/30 hover:border-matrix-green hover:shadow-neon-green/20 transition-all"
                      sizes="80px"
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Comments Popup */}
        {isCommentsOpen && (
          <CommentsPopup
            postId={post.id}
            comments={comments}
            totalCount={totalCount}
            isLoading={isLoading}
            isError={isError}
            mutate={mutate}
            onClose={closeCommentPopup}
          />
        )}
      </>
    );
  }

  // Default variant - Terminal window style
  return (
    <>
      <article className="bg-terminal-gray border border-matrix-green/30 hover:border-matrix-green hover:shadow-neon-green/20 transition-all duration-300 mb-4 rounded-lg overflow-hidden">
        {/* Terminal Window Header */}
        <div className="bg-terminal-light px-4 py-2 border-b border-matrix-green/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="flex space-x-1">
                <span className="w-2 h-2 bg-hacker-red rounded-full"></span>
                <span className="w-2 h-2 bg-hacker-yellow rounded-full"></span>
                <span className="w-2 h-2 bg-matrix-green rounded-full"></span>
              </span>
              <TechIcon className="w-3 h-3 text-matrix-cyan" />
              <span className="text-matrix-green">post@{post.id}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-text-muted">
              <span>Modified: <TimeAgo timestamp={post.created_at} /></span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-terminal-dark">
          <div className="flex gap-4 md:gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 min-w-0">
              {/* Author Info - Terminal Style */}
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-terminal-gray rounded border border-matrix-green/50 flex items-center justify-center flex-shrink-0">
                  <FaUser className="w-3 h-3 md:w-4 md:h-4 text-matrix-green" />
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base text-text-secondary min-w-0 font-mono">
                  <span className="text-matrix-green">$</span>
                  <span className="font-medium text-text-primary truncate">
                    {post.user?.name || 'anonymous'}
                  </span>
                  <span className="text-text-muted hidden sm:inline">in</span>
                  {post.categories && post.categories.length > 0 && (
                    <Link
                      href={`/category/${(post.categories[0].name || post.categories[0]).toLowerCase()}`}
                      className="text-matrix-cyan hover:text-matrix-green font-medium truncate hidden sm:inline hover:underline"
                    >
                      ./{post.categories[0].name || post.categories[0]}
                    </Link>
                  )}
                </div>
              </div>

              {/* Title - Command Style */}
              <Link href={`/p/${post.title_name}`}>
                <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3 hover:text-matrix-green transition-colors leading-tight line-clamp-2 font-mono">
                  <span className="text-hacker-yellow">$</span> cat "{post.title}"
                </h2>
              </Link>

              {/* Content Preview - Code Comment Style */}
              <div className="text-text-secondary text-sm md:text-base mb-4 md:mb-5 leading-relaxed font-mono">
                <span className="text-text-muted">//</span> <TextUtils html={post.preview_content} maxLength={120} />
              </div>

              {/* Meta Info & Actions - Terminal Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-text-muted font-mono">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-3 h-3" />
                    <TimeAgo timestamp={post.created_at} />
                  </div>
                  <span>•</span>
                  <span className="hidden sm:inline">~5 min read</span>
                </div>

                {/* Action Icons - Terminal Style */}
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Views */}
                  <div className="flex items-center gap-1 text-text-muted hover:text-matrix-cyan transition-colors">
                    <FaEye className="w-4 h-4" />
                    <span className="text-sm font-mono">{post.views || 0}</span>
                  </div>

                  {/* Clap */}
                  <button
                    onClick={handleClap}
                    disabled={clapLoading}
                    className="flex items-center gap-1 text-text-muted hover:text-hacker-yellow transition-colors hover:scale-110"
                  >
                    <FaHandsClapping className={`w-4 h-4 ${clapLoading ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-mono">{currentClapCount}</span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={toggleCommentPopup}
                    className="flex items-center gap-1 text-text-muted hover:text-matrix-green transition-colors"
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm font-mono">{post.comments_count || 0}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Image with Terminal Frame */}
            {post.image_title && (
              <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                <Link href={`/p/${post.title_name}`}>
                  <div className="relative w-full h-full">
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover rounded border border-matrix-green/50 hover:border-matrix-green hover:shadow-neon-green/30 transition-all"
                      sizes="(max-width: 768px) 96px, 128px"
                    />
                    {/* Terminal Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-terminal-black/20 pointer-events-none rounded"></div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Terminal Status Bar */}
        <div className="bg-terminal-light px-4 py-1 border-t border-matrix-green/30">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">
              Size: {post.preview_content?.length || 0} chars
            </span>
            <span className="text-matrix-green">
              Press ENTER to read more
            </span>
          </div>
        </div>
      </article>

      {/* Comments Popup */}
      {isCommentsOpen && (
        <CommentsPopup
          postId={post.id}
          comments={comments}
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          mutate={mutate}
          onClose={closeCommentPopup}
        />
      )}
    </>
  );
};

export default PostItem;
