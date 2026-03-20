'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const PostForm = dynamic(() => import('../../../components/Editor/PostForm'), {
  loading: () => <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>,
  ssr: false,
});
const CategoryTagsPopup = dynamic(() => import('../../../components/Category/CategoryTagsPopup'), {
  ssr: false,
});
import { createPost } from '../../../services/postService';
import { usePostContext } from '../../../context/PostContext';
import { FaTimes } from 'react-icons/fa';

export default function WritePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setModalOpen, loading } = useUser();
  const { setHandlePublish, setHandleUpdate } = usePostContext();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(null);
  const [imageTitle, setImageTitle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePublish = useCallback(() => {
    if (!title.trim() || !content) {
      alert('Vui lòng thêm tiêu đề và nội dung cho bài viết của bạn');
      return;
    }
    setShowPopup(true);
  }, [title, content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePublish();
      }
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handlePublish]);

  useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [loading, user, setModalOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#submit') {
      setShowPopup(true);
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router]);

  const publishFunction = useCallback(async (categories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }
    try {
      const res = await createPost({
        title,
        content,
        cover_image: imageTitle,
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      });
      router.push(`/p/${res.data.slug}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Không thể tạo bài viết.');
    }
  }, [user, title, content, imageTitle, router, setModalOpen]);

  useEffect(() => {
    setHandlePublish(() => handlePublish);
    setHandleUpdate(null);
    return () => {
      setHandlePublish(null);
    };
  }, [handlePublish, setHandlePublish, setHandleUpdate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" />
          <p style={{ marginTop: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Đang tải trình soạn thảo...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: isFullscreen ? '100dvh' : '100dvh',
        background: 'var(--bg)',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 50 : 'auto',
        overflowY: 'auto',
      }}
    >
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 50,
            padding: '0.5rem',
            borderRadius: '4px',
            background: 'rgba(242, 237, 228, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          className="hover:text-[var(--text)]"
          title="Thoát toàn màn hình"
        >
          <FaTimes style={{ width: 18, height: 18 }} />
        </button>
      )}

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '7rem 1rem 4rem' }} className="md:px-6">
        <PostForm
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          isFullscreen={isFullscreen}
        />
      </main>

      {showPopup && (
        <CategoryTagsPopup
          title={title}
          content={content}
          imageTitle={imageTitle}
          setImageTitle={setImageTitle}
          onPublish={publishFunction}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
