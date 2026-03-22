'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import { usePostContext } from '../../context/PostContext';
import { Spinner } from '../UI/Loading';
import { FaTimes } from 'react-icons/fa';

const PostForm = dynamic(() => import('./PostForm'), {
  loading: () => <div className="flex justify-center py-20"><Spinner size="lg" /></div>,
  ssr: false,
});
const PublishPanel = dynamic(() => import('../Category/PublishPanel'), {
  ssr: false,
});

/**
 * Shared editor page shell for write and edit flows.
 *
 * Props:
 *   mode         'create' | 'edit'
 *   initialTitle string (edit: pre-filled from existing post)
 *   initialContent any (edit: pre-filled from existing post)
 *   initialImage string | null
 *   initialCategories array (edit only)
 *   initialTags  array (edit only)
 *   onSave       async (selectedCategories, tags) => void  — create or update
 *   isLoadingData bool (edit: true while post is fetching)
 *   isErrorData  bool (edit: true if post fetch failed)
 *   errorMessage string (edit: displayed when isErrorData)
 */
export default function PostEditorPage({
  mode = 'create',
  initialTitle = '',
  initialContent = null,
  initialImage = null,
  initialCategories = [],
  initialTags = [],
  onSave,
  isLoadingData = false,
  isErrorData = false,
  errorMessage = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setModalOpen, loading } = useUser();
  const { setHandlePublish, setHandleUpdate } = usePostContext();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [imageTitle, setImageTitle] = useState(initialImage);
  const [showPopup, setShowPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync initial values when they arrive (edit mode — post loaded asynchronously)
  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (initialContent) setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (initialImage !== null) setImageTitle(initialImage);
  }, [initialImage]);

  const handleOpenPopup = useCallback(() => {
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
        handleOpenPopup();
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
  }, [isFullscreen, handleOpenPopup]);

  useEffect(() => {
    if (!loading && !user) setModalOpen(true);
  }, [loading, user, setModalOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#submit') {
      setShowPopup(true);
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router]);

  // Register with PostContext so Navbar publish button works
  useEffect(() => {
    if (mode === 'create') {
      setHandlePublish(handleOpenPopup);
      setHandleUpdate(null);
    } else {
      setHandlePublish(handleOpenPopup);
      setHandleUpdate(handleOpenPopup);
    }
    return () => {
      setHandlePublish(null);
      setHandleUpdate(null);
    };
  }, [mode, handleOpenPopup, setHandlePublish, setHandleUpdate]);

  const handleSave = useCallback(async (selectedCategories, tags) => {
    if (!user) { setModalOpen(true); return; }
    await onSave(selectedCategories, tags, { title, content, imageTitle });
  }, [user, onSave, title, content, imageTitle, setModalOpen]);

  /* ─── Loading / error guards ─── */
  if (loading || isLoadingData) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Đang tải trình soạn thảo...
          </p>
        </div>
      </div>
    );
  }

  if (isErrorData) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ color: '#DC2626', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
            {errorMessage || 'Không thể tải dữ liệu'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: '100dvh',
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
            position: 'fixed', top: '1rem', right: '1rem', zIndex: 50,
            padding: '0.5rem', borderRadius: '4px',
            background: 'rgba(242, 237, 228, 0.9)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            color: 'var(--text-muted)', border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'color 0.2s',
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
        <PublishPanel
          title={title}
          content={content}
          imageTitle={imageTitle}
          setImageTitle={setImageTitle}
          initialCategories={initialCategories}
          initialTags={initialTags}
          onPublish={handleSave}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
