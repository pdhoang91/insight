// components/Article/ArticleReader.js
import React, { useRef, useEffect } from 'react';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import ReadingProgressBar from '../Reading/ReadingProgressBar';
import ReadingStats from '../Reading/ReadingStats';
import TextHighlighter from '../Reading/TextHighlighter';
import BookmarkButton from '../Post/BookmarkButton';
import { FaHeart, FaComment, FaShare, FaUser } from 'react-icons/fa';
import { usePostClap } from '../../hooks/usePostClap';
import { useUser } from '../../context/UserContext';
import TimeAgo from '../Utils/TimeAgo';
import SafeImage from '../Utils/SafeImage';

const ArticleReader = ({ post }) => {
  const { user } = useUser();
  const contentRef = useRef(null);
  const { progress, isVisible, estimatedTime, timeRemaining } = useReadingProgress(contentRef);
  const { currentClapCount, clapLoading, handleClap } = usePostClap(post?.clap_count || 0);

  if (!post) {
    return (
      <div className="max-w-article mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-medium-divider rounded w-3/4"></div>
          <div className="h-4 bg-medium-divider rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-medium-divider rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleHighlight = (text, range) => {
    console.log('Highlighted text:', text);
    // TODO: Save highlight to backend
  };

  const handleComment = (text, range) => {
    console.log('Comment on text:', text);
    // TODO: Open comment modal
  };

  const handleShare = (text) => {
    const shareText = `"${text}" - ${post.title}`;
    const shareUrl = `${window.location.origin}/p/${post.title_name}`;
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    }
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Article Container */}
      <article className="max-w-article mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12">
          {/* Title */}
          <h1 className="text-article-title-mobile md:text-article-title font-serif font-bold text-medium-text-primary leading-tight mb-6">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <h2 className="text-subtitle-mobile md:text-subtitle text-medium-text-secondary font-normal leading-relaxed mb-8">
              {post.subtitle}
            </h2>
          )}

          {/* Author & Meta Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {/* Author Info */}
              <div className="flex items-center space-x-3">
                {post.user?.avatar_url ? (
                  <img
                    src={post.user.avatar_url}
                    alt={post.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-medium-accent-green rounded-full flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div>
                  <div className="font-medium text-medium-text-primary">
                    {post.user?.name || 'Anonymous'}
                  </div>
                  <div className="text-sm text-medium-text-muted">
                    <TimeAgo timestamp={post.created_at} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <BookmarkButton postId={post.id} showLabel={true} />
            </div>
          </div>

          {/* Reading Stats */}
          <ReadingStats 
            readingTime={estimatedTime}
            timeRemaining={timeRemaining}
            viewCount={post.view_count}
            showTimeRemaining={progress > 10}
            className="mb-8"
          />

          {/* Featured Image */}
          {post.image_title && (
            <div className="mb-8">
              <SafeImage
                src={post.image_title}
                alt={post.title}
                width={680}
                height={400}
                className="w-full h-auto rounded-lg"
                sizes="680px"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div 
          ref={contentRef}
          className="prose prose-lg max-w-none"
          style={{ 
            fontSize: '20px', 
            lineHeight: '1.58',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {/* Content will be rendered here */}
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="text-medium-text-primary"
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-medium-divider">
          {/* Clap & Share Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              {/* Clap Button */}
              <button
                onClick={handleClap}
                disabled={clapLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-medium-bg-secondary hover:bg-medium-divider rounded-full transition-colors"
              >
                <FaHeart className={`w-5 h-5 text-medium-text-secondary ${clapLoading ? 'animate-pulse' : ''}`} />
                <span className="text-medium-text-secondary font-medium">{currentClapCount}</span>
              </button>

              {/* Comment Button */}
              <button className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-accent-green transition-colors">
                <FaComment className="w-4 h-4" />
                <span>{post.comment_count || 0}</span>
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={() => handleShare(post.title)}
              className="flex items-center space-x-2 text-medium-text-secondary hover:text-medium-accent-green transition-colors"
            >
              <FaShare className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-medium-bg-secondary text-medium-text-secondary text-sm rounded-full hover:bg-medium-divider transition-colors cursor-pointer"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          <div className="bg-medium-bg-secondary rounded-lg p-6">
            <div className="flex items-start space-x-4">
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-medium-accent-green rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="w-8 h-8 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-serif font-bold text-medium-text-primary mb-2">
                  {post.user?.name || 'Anonymous'}
                </h3>
                <p className="text-medium-text-secondary text-sm leading-relaxed">
                  {post.user?.bio || 'Software developer passionate about technology and sharing knowledge.'}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </article>

      {/* Text Highlighter */}
      <TextHighlighter 
        onHighlight={handleHighlight}
        onComment={handleComment}
        onShare={handleShare}
      />
    </>
  );
};

export default ArticleReader;
