'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { usePostName } from '../../../../hooks/usePost';
import CommentSection from '../../../../components/Comment/CommentSection';
import PostDetail from '../../../../components/Post/PostDetail';

export default function PostPageClient({ slug, initialPost }) {
  const commentSectionRef = useRef(null);
  const { post, isLoading, isError, mutate } = usePostName(slug);

  const displayPost = post || initialPost;

  if (isLoading && !displayPost) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: 600, padding: '0 1rem' }}>
            <div className="skeleton-warm" style={{ height: '2.5rem', width: '80%', borderRadius: '2px', marginBottom: '1.25rem' }} />
            <div className="skeleton-warm" style={{ height: '2rem', width: '60%', borderRadius: '2px', marginBottom: '2rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[100, 95, 88, 92, 78].map((w, i) => (
                <div key={i} className="skeleton-warm" style={{ height: '1rem', width: `${w}%`, borderRadius: '2px' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError && !displayPost) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.015em', color: 'var(--text)', marginBottom: '0.5rem' }}>
            Failed to load post
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  if (!displayPost) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ paddingTop: 'var(--nav-height)', minHeight: '100dvh', background: 'var(--bg)' }}
    >
      <div className="max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <PostDetail post={displayPost} />

        <motion.section
          ref={commentSectionRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: '3.5rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          <CommentSection postId={displayPost.id} />
        </motion.section>
      </div>
    </motion.div>
  );
}
