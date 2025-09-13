// components/Post/ArticleReader.js - Medium 2024 Reading Experience
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArticleLayout } from '../Layout/Layout';
import Card from '../UI/Card';
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';
import AuthorInfo from './AuthorInfo';
import EngagementActions, { FloatingEngagementActions } from './EngagementActions';
import TextHighlighter from './TextHighlighter';
import RelatedArticles from '../Article/RelatedArticles';
import CommentSection from '../Comment/CommentSection';
import { useUser } from '../../context/UserContext';
import { useComments } from '../../hooks/useComments';
import TimeAgo from '../Utils/TimeAgo';

const ArticleReader = ({ post }) => {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const contentRef = useRef();
  
  const { comments, totalCommentReply, isLoading: commentsLoading } = useComments(post.id, true, 1, 10);

  if (!post) {
    return <ArticleReaderSkeleton />;
  }


  const handleFollow = () => {
    if (!user) {
      // TODO: Show login modal
      return;
    }
    setIsFollowing(!isFollowing);
    // TODO: Implement follow API
  };

  return (
    <ArticleLayout>
      {/* Floating Engagement Actions (Desktop) */}
      <div className="hidden lg:block">
        <FloatingEngagementActions 
          post={post} 
          commentsCount={totalCommentReply}
        />
      </div>

      <article className={themeClasses.layout.reading}>
        {/* Article Header - Mobile Optimized */}
        <header className="mb-8 sm:mb-10 lg:mb-12">
          {/* Title */}
          <h1 className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-medium-text-primary mb-4 sm:mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <h2 className="text-sm sm:text-base lg:text-lg text-medium-text-secondary mb-6 sm:mb-8 leading-relaxed">
              {post.subtitle}
            </h2>
          )}

          {/* Author Info & Meta - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <AuthorInfo 
              author={post.user}
              publishedAt={post.created_at}
              variant="detailed"
              showFollowButton={user && user.id !== post.user?.id}
            />
          </div>

          {/* Featured Image - Mobile Optimized */}
          {post.image_title && (
            <div className="mb-8 sm:mb-10 lg:mb-12 -mx-4 sm:mx-0">
              <img
                src={post.image_title}
                alt={post.title}
                className="w-full h-auto sm:rounded-lg"
              />
              {post.image_caption && (
                <p className="text-center text-sm text-medium-text-muted mt-3 sm:mt-4 italic px-4 sm:px-0">
                  {post.image_caption}
                </p>
              )}
            </div>
          )}
        </header>

        {/* Article Content - Mobile Optimized */}
        <div ref={contentRef} className="reading-content">
          <TextHighlighter>
            <div 
              className="prose prose-sm sm:prose-base lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </TextHighlighter>
        </div>

        {/* Article Footer - Mobile Optimized */}
        <footer className="mt-12 sm:mt-14 lg:mt-16 pt-6 sm:pt-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/tag/${tag}`}
                    className={`${themeClasses.patterns.tag} ${themeClasses.interactive.base} hover:bg-medium-accent-green hover:text-white`}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Actions (Mobile) */}
          <div className="lg:hidden mb-6 sm:mb-8">
            <EngagementActions
              post={post}
              commentsCount={totalCommentReply}
              showLabels={true}
            />
          </div>

          {/* Author Bio Card */}
          <AuthorBioCard 
            author={post.user}
            isFollowing={isFollowing}
            onFollow={handleFollow}
          />
        </footer>
      </article>

      {/* Related Articles - Mobile Optimized */}
      <div className={`${themeClasses.layout.reading} mt-12 sm:mt-14 lg:mt-16`}>
        <RelatedArticles currentPost={post} />
      </div>

      {/* Comments Section - Mobile Optimized */}
      <div className={`${themeClasses.layout.reading} mt-12 sm:mt-14 lg:mt-16`}>
        <CommentSection 
          postId={post.id}
        />
      </div>
    </ArticleLayout>
  );
};

// Author Bio Card Component
const AuthorBioCard = ({ author, isFollowing, onFollow }) => {
  if (!author) return null;

  return (
    <Card className="p-8">
      <div className="flex items-start space-x-6">
        <Link href={`/${author.username}`}>
          <Avatar
            src={author.avatar_url}
            name={author.name}
            size="xl"
            className="hover:ring-2 hover:ring-medium-accent-green/20 transition-all"
          />
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-medium-text-primary mb-1">
                Written by {author.name}
              </h3>
              <p className="text-medium-text-secondary">
                {author.followers_count || 0} Followers
              </p>
            </div>
            
            <Button
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              onClick={onFollow}
            >
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Button>
          </div>
          
          {author.bio && (
            <p className="text-medium-text-secondary leading-relaxed mb-4">
              {author.bio}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-medium-text-muted">
            <Link 
              href={`/${author.username}`}
              className="hover:text-medium-accent-green transition-colors"
            >
              More from {author.name}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Loading skeleton
const ArticleReaderSkeleton = () => (
  <ArticleLayout>
    <div className={`${themeClasses.layout.reading} animate-pulse`}>
      {/* Title skeleton */}
      <div className="mb-12">
        <div className="h-12  rounded mb-4"></div>
        <div className="h-8  rounded w-3/4 mb-8"></div>
        
        {/* Author skeleton */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12  rounded-full"></div>
          <div>
            <div className="h-4  rounded w-32 mb-2"></div>
            <div className="h-3  rounded w-24"></div>
          </div>
        </div>
        
        {/* Image skeleton */}
        <div className="h-64  rounded-lg mb-12"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4  rounded w-full"></div>
        ))}
        <div className="h-4  rounded w-2/3"></div>
      </div>
    </div>
  </ArticleLayout>
);

export default ArticleReader;
