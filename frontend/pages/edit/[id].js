// pages/edit/[id].js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../context/UserContext';
import CategoryTagsPopup from '../../components/Category/CategoryTagsPopup';
import PostForm from '../../components/Editor/PostForm';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { WriteLayout } from '../../components/Layout/Layout';
import { themeClasses } from '../../utils/themeClasses';

// Edit Page Header Component - Following home page pattern
const EditPageHeader = () => (
  <header className={`text-center lg:text-left ${themeClasses.spacing.gap}`}>
    <h1 className={`${themeClasses.typography.h1} mb-3`}>
      Chỉnh sửa bài viết
    </h1>
    <p className={`${themeClasses.typography.bodyLarge} text-medium-text-secondary max-w-2xl mx-auto lg:mx-0`}>
      Cập nhật nội dung và thông tin bài viết
    </p>
  </header>
);
import { updatePost } from '../../services/postService';
import { usePostName } from '../../hooks/usePost';
import { usePostContext } from '../../context/PostContext';
import { 
  FaTimes
} from 'react-icons/fa';

const EditPost = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, setModalOpen, loading } = useUser();
  const { setHandleUpdate, setHandlePublish } = usePostContext();

  const { post, isLoading, isError } = usePostName(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageTitle, setImageTitle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when post loads
  useEffect(() => {
    if (post && !isInitialized) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setImageTitle(post.image_title || null);
      setIsInitialized(true);
    }
  }, [post, isInitialized]);

  useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [loading, user, setModalOpen]);

  // Auto-save functionality
  const handleSaveDraft = async () => {
    try {
      setSaveStatus('saving');
      // TODO: Implement save draft functionality

      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };


  // Auto-save functionality
  useEffect(() => {
    if (!title && !content) return;
    
    const autoSaveTimer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        handleSaveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [title, content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + S for save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      // Cmd/Ctrl + Enter for update
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleUpdate();
      }
      // F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      // Escape to exit fullscreen
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handleSaveDraft]);

  const updateFunction = useCallback(async (categories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }

    try {
      const res = await updatePost(post.id, {
        title,
        content,
        image_title: imageTitle,
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      });
      router.push(`/p/${res.data.title_name}`);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post.');
    }
  }, [user, title, content, imageTitle, post?.id, router]);

  const handleUpdate = useCallback(() => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng thêm tiêu đề và nội dung cho bài viết của bạn');
      return;
    }
    setShowPopup(true);
  }, [title, content]);

  useEffect(() => {
    setHandleUpdate(() => handleUpdate);
    setHandlePublish(() => handleUpdate);
    return () => {
      setHandleUpdate(null);
      setHandlePublish(null);
    };
  }, [handleUpdate, setHandleUpdate, setHandlePublish]);

  useEffect(() => {
    if (router.asPath.includes('#submit')) {
      setShowPopup(true);
      router.replace(`/edit/${id}`, undefined, { shallow: true });
    }
  }, [router.asPath, router, id]);

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved';
      case 'error': return 'Error';
      default: return 'Save Draft';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-secondary';
      case 'saved': return 'text-primary';
      case 'error': return 'text-danger';
      default: return 'text-muted';
    }
  };

  if (!router.isReady || isLoading || loading) {
    return (
      <div className="min-h-screen bg-medium-bg-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medium-text-secondary">Đang tải trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-medium-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-serif text-lg mb-2">Lỗi khi tải bài viết</div>
          <p className="text-medium-text-muted">Không thể tìm thấy bài viết bạn muốn chỉnh sửa.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-medium-bg-primary' : ''}`}>
      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-medium-bg-secondary/80 backdrop-blur-sm text-medium-text-secondary hover:text-medium-text-primary rounded-lg transition-colors"
          title="Thoát toàn màn hình"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      )}

      {isFullscreen ? (
        /* Fullscreen Mode - Direct rendering */
        <main className={`${themeClasses.layout.container} pt-16 md:pt-20`}>
          <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)]">
            <PostForm
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              imageTitle={imageTitle}
              setImageTitle={setImageTitle}
              isFullscreen={isFullscreen}
            />
          </div>
        </main>
      ) : (
        /* Normal Mode - Use optimized WriteLayout */
        <WriteLayout>
          <EditPageHeader />
          
          <PostForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            imageTitle={imageTitle}
            setImageTitle={setImageTitle}
            isFullscreen={isFullscreen}
          />
        </WriteLayout>
      )}

      {/* Update Modal */}
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
};

export default EditPost;
