'use client';

import React, { useRef } from 'react';
import { usePostName } from '../../../../hooks/usePost';
import CommentSection from '../../../../components/Comment/CommentSection';
import PostDetail from '../../../../components/Post/PostDetail';
import LoadingSpinner from '../../../../components/Shared/LoadingSpinner';

export default function PostPageClient({ slug, initialPost }) {
  const commentSectionRef = useRef(null);
  const { post, isLoading, isError, mutate } = usePostName(slug);

  const displayPost = post || initialPost;

  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (isLoading && !displayPost)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[#6b6b6b] text-sm">Loading...</p>
        </div>
      </div>
    );

  if (isError && !displayPost)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#242424] mb-2 font-serif text-lg">
            Failed to load post
          </div>
          <p className="text-[#6b6b6b] text-sm">Please try again later</p>
        </div>
      </div>
    );

  if (!displayPost) return null;

  return (
    <div className="pt-16 px-4 md:px-6">
      <div className="py-8">
        <PostDetail post={displayPost} onScrollToComments={scrollToComments} />

        <section
          ref={commentSectionRef}
          className="max-w-[680px] mx-auto mt-12 pt-8 border-t border-medium-border"
        >
          <CommentSection postId={displayPost.id} />
        </section>
      </div>
    </div>
  );
}
