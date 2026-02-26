'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useUser } from '../../../../context/UserContext';
import LoadingSpinner from '../../../../components/Shared/LoadingSpinner';

const PostForm = dynamic(() => import('../../../../components/Editor/PostForm'), {
  loading: () => <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>,
  ssr: false,
});
const CategoryTagsPopup = dynamic(() => import('../../../../components/Category/CategoryTagsPopup'), {
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

  const updateFunction = useCallback(async (categories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }
    try {
      const res = await updatePost(post.id, {
        title,
        content,
        cover_image: imageTitle,
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
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

  // #region agent log
  fetch('http://127.0.0.1:7476/ingest/15469c75-35dc-48d4-bf40-8d2565f7ce6f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6f33ee'},body:JSON.stringify({sessionId:'6f33ee',location:'edit/[id]/page.js:guards',message:'EditPage render state',data:{id,isLoading,loading,isError,hasPost:!!post,postUserId:post?.user?.id,userId:user?.id,isInitialized,hasUser:!!user},timestamp:Date.now(),runId:'run1',hypothesisId:'H1-H2-H5'})}).catch(()=>{});
  // #endregion

  if (isLoading || loading) {
    // #region agent log
    fetch('http://127.0.0.1:7476/ingest/15469c75-35dc-48d4-bf40-8d2565f7ce6f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6f33ee'},body:JSON.stringify({sessionId:'6f33ee',location:'edit/[id]/page.js:loading-guard',message:'Blocked by loading guard',data:{isLoading,loading},timestamp:Date.now(),runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Đang tải trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-serif text-lg mb-2">Lỗi khi tải bài viết</div>
          <p className="text-medium-text-muted">Không thể tìm thấy bài viết bạn muốn chỉnh sửa.</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // #region agent log
  if (post && user && post.user?.id !== user.id && !isSuperAdmin()) { fetch('http://127.0.0.1:7476/ingest/15469c75-35dc-48d4-bf40-8d2565f7ce6f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6f33ee'},body:JSON.stringify({sessionId:'6f33ee',location:'edit/[id]/page.js:ownership-guard',message:'Blocked by ownership guard',data:{postUserId:post?.user?.id,userId:user?.id,isSuperAdmin:isSuperAdmin()},timestamp:Date.now(),runId:'run1',hypothesisId:'H2'})}).catch(()=>{}); }
  // #endregion
  if (post && user && post.user?.id !== user.id && !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-serif text-lg mb-2">Không có quyền chỉnh sửa</div>
          <p className="text-medium-text-muted">Bạn không phải là tác giả của bài viết này.</p>
        </div>
      </div>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7476/ingest/15469c75-35dc-48d4-bf40-8d2565f7ce6f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6f33ee'},body:JSON.stringify({sessionId:'6f33ee',location:'edit/[id]/page.js:init-guard',message:'Checking isInitialized',data:{isInitialized,title,hasContent:!!content},timestamp:Date.now(),runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Đang tải trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'min-h-screen bg-white'}>
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
          onPublish={updateFunction}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
