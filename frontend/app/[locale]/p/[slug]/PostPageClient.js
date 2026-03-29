'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePostName } from '../../../../hooks/usePost';
import CommentSection from '../../../../components/Comment/CommentSection';
import PostDetail from '../../../../components/Post/PostDetail';
import { HomeLayout } from '../../../../components/Layout/Layout';
import PersonalBlogSidebar from '../../../../components/Sidebar/PersonalBlogSidebar';

export default function PostPageClient({ slug, initialPost, initialHtml }) {
  const commentSectionRef = useRef(null);
  const { post, isLoading, isError } = usePostName(slug, {
    fallbackData: initialPost,
  });

  const displayPost = post || initialPost;
  const isLocalImage = (src) => src?.includes('localhost');

  if (isLoading && !displayPost) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <div style={{ maxWidth: 600 }}>
          <div className="skeleton-warm" style={{ height: '2.5rem', width: '80%', borderRadius: '2px', marginBottom: '1.25rem' }} />
          <div className="skeleton-warm" style={{ height: '2rem', width: '60%', borderRadius: '2px', marginBottom: '2rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[100, 95, 88, 92, 78].map((w, i) => (
              <div key={i} className="skeleton-warm" style={{ height: '1rem', width: `${w}%`, borderRadius: '2px' }} />
            ))}
          </div>
        </div>
      </HomeLayout>
    );
  }

  if (isError && !displayPost) {
    return (
      <HomeLayout sidebar={<PersonalBlogSidebar />}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
          Failed to load post
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Please try again later
        </p>
      </HomeLayout>
    );
  }

  if (!displayPost) return null;

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* ── Layer 1: image strip (same as BasePostItem) ── */}
        {displayPost.cover_image && (
          <div className="post-card-img">
            <Image
              src={displayPost.cover_image}
              alt={displayPost.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 680px"
              style={{ objectFit: 'cover' }}
              unoptimized={isLocalImage(displayPost.cover_image)}
            />
          </div>
        )}

        {/* ── Layer 2: floating content panel (same as BasePostItem) ── */}
        <div className={displayPost.cover_image ? 'post-card-panel' : 'py-4'}>
          <PostDetail post={displayPost} htmlContent={initialHtml} />
        </div>

        {/* ── Comments ── */}
        <motion.section
          ref={commentSectionRef}
          id="comments"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: '3.5rem', paddingTop: '2.5rem' }}
        >
          <CommentSection postId={displayPost.id} />
        </motion.section>
      </motion.div>
    </HomeLayout>
  );
}
