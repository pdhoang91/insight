// pages/p/[id].js
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useRef } from 'react';
import { usePostName } from '../../hooks/usePost';
import CommentSection from '../../components/Comment/CommentSection';
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
        <p className="mt-4 text-[#6b6b6b] text-sm">Loading...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-[#242424] mb-2 font-serif text-lg">Failed to load post</div>
        <p className="text-[#6b6b6b] text-sm">Please try again later</p>
      </div>
    </div>
  );

  return (
    <div className="pt-20 pb-16 px-5 md:px-6">
      <PostDetail
        post={post}
        onScrollToComments={scrollToComments}
      />

      <section ref={commentSectionRef} className="max-w-[680px] mx-auto mt-12 pt-8 border-t border-medium-border">
        <CommentSection postId={post.id} />
      </section>
    </div>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'vi', ['common'])),
  },
});

export default PostPage;
