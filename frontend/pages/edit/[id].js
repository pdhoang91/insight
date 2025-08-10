// pages/edit/[id].js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import CategoryTagsPopup from '../../components/Category/CategoryTagsPopup';
import PostForm from '../../components/Editor/PostForm';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import Navbar from '../../components/Navbar/Navbar';
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

  const handleUpdate = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please add a title and content to your post');
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
  }, [isFullscreen, handleSaveDraft, handleUpdate]);

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

  useEffect(() => {
    setHandleUpdate(() => updateFunction);
    setHandlePublish(null);
    return () => {
      setHandleUpdate(null);
    };
  }, [updateFunction, setHandleUpdate, setHandlePublish]);

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
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <div className="text-danger font-mono mb-2">Failed to load post</div>
          <p className="text-muted">The post you're trying to edit could not be found.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Custom Navbar with Update functionality */}
      {!isFullscreen && <Navbar onPublish={handleUpdate} />}
      
      <div className={`min-h-screen bg-app transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 pt-0' : ''}`}>

        {/* Fullscreen Exit Button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 z-50 p-2 bg-surface/80 backdrop-blur-sm text-secondary hover:text-primary rounded-lg transition-colors"
            title="Exit fullscreen"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}

        {/* Main Content */}
        <main className={`transition-all duration-300 ${isFullscreen ? 'p-8' : ''}`}>
          <div className={`px-4 sm:px-6 lg:px-8 ${isFullscreen ? 'py-4' : 'py-8'}`}>

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
    </>
  );
};

export default EditPost;
