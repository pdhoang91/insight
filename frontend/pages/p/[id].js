// pages/p/[id].js
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import { usePostName } from '../../hooks/usePost';
import CommentSection from '../../components/Comment/CommentSection';
import { ReadingLayout } from '../../components/Layout/Layout';
import PostDetail from '../../components/Post/PostDetail';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { themeClasses, componentClasses } from '../../utils/themeClasses';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const commentSectionRef = useRef(null);
  const { post, isLoading, isError, mutate } = usePostName(id);

  const scrollToComments = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (isLoading) return (
    <div className={componentClasses.pageLoading}>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-medium-text-secondary">Loading post...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className={componentClasses.pageError}>
      <div className="text-center">
        <div className="text-error mb-2 font-serif text-lg">Failed to load post</div>
        <p className="text-medium-text-muted text-body-small">Please try again later</p>
      </div>
    </div>
  );

  return (
    <ReadingLayout>
      <PostDetail 
        post={post}
        onScrollToComments={scrollToComments}
      />
      
      {/* Comments Section */}
      <section ref={commentSectionRef} className={`${themeClasses.spacing.section}`}>
        <CommentSection postId={post.id} />
      </section>
    </ReadingLayout>
  );
};

export default PostPage;
