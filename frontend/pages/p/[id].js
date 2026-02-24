// pages/p/[id].js
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useRef } from 'react';
import { usePostName } from '../../hooks/usePost';
import CommentSection from '../../components/Comment/CommentSection';
import { ReadingLayout } from '../../components/Layout/Layout';
import PostDetail from '../../components/Post/PostDetail';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const commentSectionRef = useRef(null);
  const { post, isLoading, isError, mutate } = usePostName(id);

  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-medium-text-secondary">Loading post...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 mb-2 font-serif text-lg">Failed to load post</div>
        <p className="text-medium-text-muted text-sm">Please try again later</p>
      </div>
    </div>
  );

  return (
    <ReadingLayout>
      <PostDetail
        post={post}
        onScrollToComments={scrollToComments}
      />

      <section ref={commentSectionRef} className="mt-12 pt-8 border-t border-medium-border">
        <CommentSection postId={post.id} />
      </section>
    </ReadingLayout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
  },
});

export default PostPage;
