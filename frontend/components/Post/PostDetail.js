// components/Post/PostDetail.js
import React, { useRef, useState } from 'react';
import { FaComment, FaEye } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import CommentSection from '../Comment/CommentSection';
import Rating from './Rating';
import { Container, ContentArea, Card } from '../UI';

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
    <Container>
      <ContentArea>
        <Card variant="surface" className="post-detail">
          {/* Header Section */}
          <header className="post-detail-header">
            <h1 className="post-detail-title">{post.title}</h1>
            
            {/* Meta Information */}
            <div className="post-detail-meta">
              <div className="post-detail-meta-primary">
                <span>Published on {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="post-detail-meta-secondary">
                <div className="flex items-center gap-1">
                  <FaEye className="w-3 h-3" />
                  <span>{post.views || 0} views</span>
                </div>
                <span>~{Math.ceil(post.content?.replace(/<[^>]*>/g, '').length / 200) || 1} min read</span>
              </div>
            </div>
          </header>

          {/* Interaction Section */}
          <div className="post-detail-interactions">
            {/* Claps */}
            <button
              onClick={handleClap}
              disabled={clapLoading}
              className="post-detail-interaction-btn"
            >
              <FaHandsClapping className="w-4 h-4" /> 
              <span>{currentClapCount} claps</span>
            </button>

            {/* Comments */}
            <button 
              onClick={scrollToComments} 
              className="post-detail-interaction-btn"
            >
              <FaComment className="w-4 h-4" /> 
              <span>{post.comments_count || 0} comments</span>
            </button>
          </div>

          {/* Post Content */}
          <div className="post-detail-content">
            {/* Featured Image */}
            {post.image_title && (
              <img
                src={post.image_title}
                alt={post.title}
                className="post-detail-image"
              />
            )}

            {/* Content */}
            <div 
              className="post-detail-prose" 
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Rating Section */}
          <div className="post-detail-section">
            <h3 className="post-detail-section-title">Rate this article</h3>
            <Rating postId={post.id} />
          </div>

          {/* Comments Section */}
          <div className="post-detail-section" ref={commentSectionRef}>
            <h3 className="post-detail-section-title">Comments ({post.comments_count || 0})</h3>
            <CommentSection
              postId={post.id}
              comments={comments}
              totalCount={totalCount}
              isLoading={isLoading}
              isError={isError}
              mutate={mutate}
            />
          </div>
        </Card>
      </ContentArea>
    </Container>
  );
};

export default PostDetail;
