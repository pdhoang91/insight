// pages/p/[id].js
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { usePostName } from '../../hooks/usePost';
import { useUser } from '../../context/UserContext';
import { clapPost } from '../../services/activityService';
import CommentSection from '../../components/Comment/CommentSection';
import ThreeColumnLayout from '../../components/Layout/ThreeColumnLayout';
import PostDetail from '../../components/Post/PostDetail';
import { LoadingSpinner } from '../../components/UI';

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
    <div className="min-h-screen bg-terminal-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">Loading post...</p>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="min-h-screen bg-terminal-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-hacker-red mb-2">Failed to load post</div>
        <p className="text-text-muted text-sm">Please try again later</p>
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
      <div ref={commentSectionRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <CommentSection postId={post.id} user={user} />
      </div>


    </ThreeColumnLayout>
  );
};

export default PostPage;
