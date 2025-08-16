import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import CategoryTagsPopup from '../components/Category/CategoryTagsPopup';
import PostForm from '../components/Editor/PostForm';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import Navbar from '../components/Navbar/Navbar';
import { createPost } from '../services/postService';
import { usePostContext } from '../context/PostContext';
import { FaTimes } from 'react-icons/fa';

const Write = () => {
  const router = useRouter();
  const { user, setModalOpen, loading } = useUser();
  const { setHandlePublish, setHandleUpdate } = usePostContext();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageTitle, setImageTitle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Function definitions
  const handleSaveDraft = async () => {
    try {
      setSaveStatus('saving');
      // TODO: Implement save draft functionality
      console.log('Save draft:', { title, content, imageTitle });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng thêm tiêu đề và nội dung cho bài viết của bạn');
      return;
    }
    setShowPopup(true);
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
  }, [title, content, handleSaveDraft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + S for save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      // Cmd/Ctrl + Enter for publish
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePublish();
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
  }, [isFullscreen, handleSaveDraft, handlePublish]);

  useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [loading, user, setModalOpen]);

  useEffect(() => {
    if (router.asPath.includes('#submit')) {
      setShowPopup(true);
      router.replace('/write', undefined, { shallow: true });
    }
  }, [router.asPath, router]);

  const publishFunction = useCallback(async (categories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }
    try {
      const res = await createPost({
        title,
        content,
        image_title: imageTitle,
        author_id: user.id,
        author: user.name,
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      });
      router.push(`/p/${res.data.title_name}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Không thể tạo bài viết.');
    }
  }, [user, title, content, imageTitle, router]);

  useEffect(() => {
    setHandlePublish(() => publishFunction);
    setHandleUpdate(null);
    return () => {
      setHandlePublish(null);
    };
  }, [publishFunction, setHandlePublish, setHandleUpdate]);

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Đang lưu...';
      case 'saved': return 'Đã lưu';
      case 'error': return 'Lỗi';
      default: return 'Lưu Bản Nháp';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary">Đang tải trình soạn thảo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Custom Navbar with Publish functionality */}
      {!isFullscreen && <Navbar onPublish={handlePublish} />}
      
      <div className={`min-h-screen bg-terminal-black transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 pt-0' : ''}`}>


      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-terminal-gray/80 backdrop-blur-sm text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          title="Thoát toàn màn hình"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      )}

              {/* Main Content */}
        <main className={`transition-all duration-300 ${isFullscreen ? 'p-8' : ''}`}>
          <div className={`px-4 sm:px-6 lg:px-8 ${isFullscreen ? 'py-4' : 'py-4'}`}>

            {/* Editor Container */}
            <div className={`transition-all duration-300 ${isFullscreen ? 'h-[calc(100vh-3.5rem)]' : ''}`}>
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

 
          </div>
        </main>

      {/* Publish Modal */}
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
    </>
  );
};

export default Write;
