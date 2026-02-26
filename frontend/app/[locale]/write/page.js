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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Đang tải trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'min-h-screen bg-white'}>
      {/* Fullscreen exit */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-sm text-medium-text-secondary hover:text-medium-text-primary transition-colors"
          title="Thoát toàn màn hình"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      )}

      <main className="max-w-[720px] mx-auto px-4 md:px-6 pt-28 pb-16">
        <PostForm
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          imageTitle={imageTitle}
          setImageTitle={setImageTitle}
          isFullscreen={isFullscreen}
        />
      </main>

      {showPopup && (
        <CategoryTagsPopup
          title={title}
          content={content}
          imageTitle={imageTitle}
          onPublish={publishFunction}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
