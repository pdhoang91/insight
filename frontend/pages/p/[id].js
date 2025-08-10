// pages/p/[id].js
import { useRouter } from 'next/router';
import React from 'react';
import { usePostName } from '../../hooks/usePost';
import PostDetail from '../../components/Post/PostDetail';
import { Container, LoadingSpinner } from '../../components/UI';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { post, isLoading, isError, mutate } = usePostName(id);

  if (isLoading) return (
    <Container variant="loading">
      <div className="loading-card">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-secondary font-mono">Loading post...</p>
      </div>
    </Container>
  );
  
  if (isError) return (
    <Container variant="loading">
      <div className="error-card">
        <div className="font-mono">Failed to load post</div>
        <p className="mt-2 text-sm">Please try again later</p>
      </div>
    </Container>
  );

  return <PostDetail post={post} />;
};

export default PostPage;
