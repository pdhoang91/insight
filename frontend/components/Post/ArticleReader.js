// components/Post/ArticleReader.js - Medium 2024 Reading Experience
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { themeClasses, combineClasses } from '../../utils/themeClasses';
import { renderPostContent } from '../../utils/renderContent';
import { useTranslations } from 'next-intl';

const ArticleReader = ({ post }) => {
  const t = useTranslations();
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const contentRef = useRef();
  
  const { comments, totalCommentReply, isLoading: commentsLoading } = useComments(post.id, true, 1, 10);

  const renderedHTML = useMemo(
    () => renderPostContent(post.content),
    [post.content]
  );

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
        <header className={combineClasses(themeClasses.spacing.stackLarge)}>
          {/* Title */}
          <h1 className={combineClasses(
            themeClasses.typography.h1,
            themeClasses.text.primary,
            themeClasses.spacing.marginBottomMedium,
            'leading-tight'
          )}>
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <h2 className={combineClasses(
              themeClasses.typography.h3,
              themeClasses.text.secondary,
              themeClasses.spacing.marginBottomLarge,
              'leading-relaxed'
            )}>
              {post.subtitle}
            </h2>
          )}

          {/* Author Info & Meta - Mobile Optimized */}
          <div className={themeClasses.spacing.marginBottomLarge}>
            <AuthorInfo 
              author={post.user}
              publishedAt={post.created_at}
              variant="detailed"
              showFollowButton={user && user.id !== post.user?.id}
            />
          </div>

          {/* Featured Image - Mobile Optimized */}
          {post.cover_image && (
            <div className={combineClasses(
              themeClasses.spacing.marginBottomXLarge,
              '-mx-4 sm:mx-0'
            )}>
              <img
                src={post.cover_image}
                alt={post.title}
                className={combineClasses(
                  'w-full h-auto',
                  'sm:rounded-lg'
                )}
              />
              {post.image_caption && (
                <p className={combineClasses(
                  'text-center italic px-4 sm:px-0',
                  themeClasses.text.bodySmall,
                  themeClasses.text.muted,
                  'mt-3 sm:mt-4'
                )}>
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
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />
          </TextHighlighter>
        </div>

        {/* Article Footer - Mobile Optimized */}
        <footer className={combineClasses(
          themeClasses.spacing.marginTopXLarge,
          themeClasses.spacing.paddingTopLarge
        )}>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={themeClasses.spacing.marginBottomLarge}>
              <div className={combineClasses(
                'flex flex-wrap',
                themeClasses.spacing.gapSmall
              )}>
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/tag/${tag}`}
                    className={combineClasses(
                      themeClasses.patterns.tag,
                      themeClasses.interactive.base,
                      'hover:bg-medium-accent-green hover:text-white',
                      themeClasses.animations.smooth
                    )}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Actions (Mobile) */}
          <div className={combineClasses(
            'lg:hidden',
            themeClasses.spacing.marginBottomLarge
          )}>
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
            t={t}
          />
        </footer>
      </article>

      {/* Related Articles - Mobile Optimized */}
      <div className={combineClasses(
        themeClasses.layout.reading,
        themeClasses.spacing.marginTopXLarge
      )}>
        <RelatedArticles currentPost={post} />
      </div>

      {/* Comments Section - Mobile Optimized */}
      <div className={combineClasses(
        themeClasses.layout.reading,
        themeClasses.spacing.marginTopXLarge
      )}>
        <CommentSection 
          postId={post.id}
        />
      </div>
    </ArticleLayout>
  );
};

// Author Bio Card Component
const AuthorBioCard = ({ author, isFollowing, onFollow, t }) => {
  if (!author) return null;

  return (
    <Card className={themeClasses.spacing.cardLarge}>
      <div className={combineClasses(
        'flex items-start',
        themeClasses.spacing.gapLarge
      )}>
        <Link href={`/${author.username}`}>
          <Avatar
            src={author.avatar_url}
            name={author.name}
            size="xl"
            className={combineClasses(
              themeClasses.interactive.ringHover,
              themeClasses.animations.smooth
            )}
          />
        </Link>
        
        <div className="flex-1">
          <div className={combineClasses(
            'flex items-center justify-between',
            themeClasses.spacing.marginBottomMedium
          )}>
            <div>
              <h3 className={combineClasses(
                themeClasses.typography.h3,
                themeClasses.typography.weightBold,
                themeClasses.text.primary,
                'mb-1'
              )}>
                {t('post.writtenBy')} {author.name}
              </h3>
              <p className={themeClasses.text.secondary}>
                {author.followers_count || 0} {t('post.followers')}
              </p>
            </div>
            
            <Button
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              onClick={onFollow}
            >
              {isFollowing ? t('post.following') : t('post.follow')}
            </Button>
          </div>
          
          {author.bio && (
            <p className={combineClasses(
              themeClasses.text.secondary,
              'leading-relaxed',
              themeClasses.spacing.marginBottomMedium
            )}>
              {author.bio}
            </p>
          )}
          
          <div className={combineClasses(
            'flex items-center',
            themeClasses.spacing.gapMedium,
            themeClasses.text.bodySmall,
            themeClasses.text.muted
          )}>
            <Link 
              href={`/${author.username}`}
              className={combineClasses(
                themeClasses.text.accentHover,
                themeClasses.animations.smooth
              )}
            >
              {t('post.moreFrom')} {author.name}
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
    <div className={combineClasses(
      themeClasses.layout.reading,
      'animate-pulse'
    )}>
      {/* Title skeleton */}
      <div className={themeClasses.spacing.marginBottomXLarge}>
        <div className={combineClasses(
          'h-12 mb-4',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
        <div className={combineClasses(
          'h-8 w-3/4 mb-8',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
        
        {/* Author skeleton */}
        <div className={combineClasses(
          'flex items-center mb-8',
          themeClasses.spacing.gapMedium
        )}>
          <div className={combineClasses(
            'w-12 h-12 rounded-full',
            themeClasses.patterns.skeleton
          )}></div>
          <div>
            <div className={combineClasses(
              'h-4 w-32 mb-2',
              themeClasses.patterns.skeleton,
              themeClasses.effects.rounded
            )}></div>
            <div className={combineClasses(
              'h-3 w-24',
              themeClasses.patterns.skeleton,
              themeClasses.effects.rounded
            )}></div>
          </div>
        </div>
        
        {/* Image skeleton */}
        <div className={combineClasses(
          'h-64 mb-12',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
      </div>
      
      {/* Content skeleton */}
      <div className={themeClasses.spacing.stackMedium}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={combineClasses(
            'h-4 w-full',
            themeClasses.patterns.skeleton,
            themeClasses.effects.rounded
          )}></div>
        ))}
        <div className={combineClasses(
          'h-4 w-2/3',
          themeClasses.patterns.skeleton,
          themeClasses.effects.rounded
        )}></div>
      </div>
    </div>
  </ArticleLayout>
);

export default ArticleReader;
