// pages/p/[id].js
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { usePostName } from '../../hooks/usePost';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import CommentSection from '../../components/Comment/CommentSection';
import ThreeColumnLayout from '../../components/Layout/ThreeColumnLayout';
import PostDetail from '../../components/Post/PostDetail';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const commentSectionRef = useRef(null);
  const { user } = useUser();
  const [clapLoading, setClapLoading] = useState(false);
  const [currentClapCount, setCurrentClapCount] = useState(0);

  const { post, isLoading, isError, mutate } = usePostName(id);

  // Update clap count when post loads
  React.useEffect(() => {
    if (post) {
      setCurrentClapCount(post.clap_count || 0);
    }
  }, [post]);

  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để vỗ tay.');
      return;
    }
    if (clapLoading) return;

    setClapLoading(true);
    try {
      await clapPost(post.id);
      setCurrentClapCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Có lỗi xảy ra khi vỗ tay. Vui lòng thử lại.');
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

  if (isLoading) return (
    <div className="min-h-screen bg-medium-bg-primary flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-medium-text-secondary">Loading post...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="min-h-screen bg-medium-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="text-error mb-2 font-serif text-lg">Failed to load post</div>
        <p className="text-medium-text-muted text-body-small">Please try again later</p>
      </div>
    </div>
  );

  return (
    <ThreeColumnLayout 
      content={post.content}
      showTOC={true}
    >
      <PostDetail 
        post={post}
        currentClapCount={currentClapCount}
        clapLoading={clapLoading}
        onClap={handleClap}
        onScrollToComments={scrollToComments}
      />
      
      {/* Comments Section */}
      <div ref={commentSectionRef} className="mt-12">
        <CommentSection postId={post.id} />
      </div>




    </ThreeColumnLayout>
  );
};

export default PostPage;
