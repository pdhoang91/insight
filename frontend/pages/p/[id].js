// pages/p/[id].js
import { useRouter } from 'next/router';
import React from 'react';
import { usePostName } from '../../hooks/usePost';
import PostDetail from '../../components/Post/PostDetail';
import { LoadingSpinner } from '../../components/UI';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { post, isLoading, isError, mutate } = usePostName(id);

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

  return <PostDetail post={post} />;
};

export default PostPage;
