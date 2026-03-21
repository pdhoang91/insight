'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useUser } from '../../../../context/UserContext';
import LoadingSpinner from '../../../../components/Shared/LoadingSpinner';

const PostForm = dynamic(() => import('../../../../components/Editor/PostForm'), {
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
      <LoadingSpinner size="lg" />
    </div>
  ),
  ssr: false,
});
const PublishPanel = dynamic(() => import('../../../../components/Category/PublishPanel'), {
  ssr: false,
});
import { updatePost } from '../../../../services/postService';
import { usePostName } from '../../../../hooks/usePost';
import { usePostContext } from '../../../../context/PostContext';
import { isSuperAdmin } from '../../../../services/authService';
import { FaTimes } from 'react-icons/fa';

export default function EditPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id;
  const { user, setModalOpen, loading } = useUser();
  const { setHandleUpdate, setHandlePublish } = usePostContext();

  const { post, isLoading, isError } = usePostName(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(null);
  const [imageTitle, setImageTitle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (post && !isInitialized) {
      setTitle(post.title || '');
      setContent(post.content || null);
      setImageTitle(post.cover_image || null);
      setIsInitialized(true);
    }
  }, [post, isInitialized]);

  useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [loading, user, setModalOpen]);

  const handleUpdate = useCallback(() => {
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
        handleUpdate();
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
  }, [isFullscreen, handleUpdate]);

  const updateFunction = useCallback(async (selectedCategories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }
    try {
      const res = await updatePost(post.id, {
        title,
        content,
        cover_image: imageTitle,
        categories: selectedCategories.map(cat => cat.name),
        tags: tags,
      });
      router.push(`/p/${res.data.slug}`);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Không thể cập nhật bài viết.');
    }
  }, [user, title, content, imageTitle, post?.id, router, setModalOpen]);

  useEffect(() => {
    setHandleUpdate(() => handleUpdate);
    setHandlePublish(() => handleUpdate);
    return () => {
      setHandleUpdate(null);
      setHandlePublish(null);
    };
  }, [handleUpdate, setHandleUpdate, setHandlePublish]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#submit') {
      setShowPopup(true);
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router]);

  if (isLoading || loading) {
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

  if (isError) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ color: '#DC2626', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
            Lỗi khi tải bài viết
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            Không thể tìm thấy bài viết bạn muốn chỉnh sửa.
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (post && user && post.user?.id !== user.id && !isSuperAdmin()) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ color: '#DC2626', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
            Không có quyền chỉnh sửa
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            Bạn không phải là tác giả của bài viết này.
          </p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
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
        <PublishPanel
          title={title}
          content={content}
          imageTitle={imageTitle}
          setImageTitle={setImageTitle}
          initialCategories={post?.categories || []}
          initialTags={post?.tags?.map(t => t.name) || []}
          onPublish={updateFunction}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
