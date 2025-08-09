import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import CategoryTagsPopup from '../components/Category/CategoryTagsPopup';
import PostForm from '../components/Editor/PostForm';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import Button from '../components/Utils/Button';
import { createPost } from '../services/postService';
import { usePostContext } from '../context/PostContext';
import { 
  FaRobot, 
  FaArrowLeft, 
  FaEye, 
  FaSave, 
  FaExpand,
  FaTimes,
  FaClock,
  FaFileAlt
} from 'react-icons/fa';

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
  const [focusMode, setFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

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
      alert('Please add a title and content to your post');
      return;
    }
    setShowPopup(true);
  };

  // Calculate word count and reading time
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 words/minute
  }, [content]);

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
      // Escape to exit focus mode or fullscreen
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (focusMode) {
          setFocusMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, focusMode, handleSaveDraft, handlePublish]);

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
      alert('Failed to create post.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-app transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Navigation Bar */}
      <nav className={`sticky top-0 z-40 bg-app/95 backdrop-blur-sm border-b border-border-primary transition-all duration-300 ${focusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-secondary hover:text-primary rounded-lg transition-colors"
                title="Go back"
              >
                <FaArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="hidden sm:block">
                <span className="text-lg font-semibold text-primary">Write</span>
              </div>
            </div>

            {/* Center Section - Writing Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm text-muted">
              <div className="flex items-center space-x-2">
                <FaFileAlt className="w-4 h-4" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Writing Tools */}
              <div className="hidden sm:flex items-center space-x-1">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`p-2 rounded-lg transition-colors ${focusMode ? 'text-primary bg-primary/10' : 'text-secondary hover:text-primary'}`}
                  title="Focus mode"
                >
                  <FaEye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-secondary hover:text-primary rounded-lg transition-colors"
                  title="Toggle fullscreen"
                >
                  {isFullscreen ? <FaTimes className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
                </button>

                <Link 
                  href="/aiwrite" 
                  className="p-2 text-secondary hover:text-primary rounded-lg transition-colors" 
                  title="AI Assistant"
                >
                  <FaRobot className="w-4 h-4" />
                </Link>
              </div>

              {/* Save Status */}
              <div className="flex items-center space-x-3">
                <span className={`text-xs ${getSaveStatusColor()}`}>
                  {getSaveStatusText()}
                </span>
                
                <Button
                  onClick={handleSaveDraft}
                  variant="ghost"
                  size="sm"
                  disabled={saveStatus === 'saving'}
                  className="hidden sm:flex items-center space-x-2 text-xs px-3 py-1.5"
                >
                  {saveStatus === 'saving' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FaSave className="w-3 h-3" />
                  )}
                  <span>Save</span>
                </Button>
                
                <Button
                  onClick={handlePublish}
                  size="sm"
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 text-sm font-medium"
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${focusMode ? 'max-w-4xl mx-auto' : 'max-w-6xl mx-auto'}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message for New Users */}
          {!title && !content && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center py-12"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Start Writing</h2>
              <p className="text-secondary max-w-md mx-auto mb-6">
                Share your thoughts, ideas, and stories with the world. Every great article starts with a single word.
              </p>
              
              {/* Keyboard shortcuts hint */}
              <div className="max-w-sm mx-auto bg-surface/50 rounded-lg p-4 border border-border-primary">
                <p className="text-xs text-muted mb-2 font-mono">Keyboard Shortcuts</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-secondary">
                  <div><kbd className="px-1 py-0.5 bg-elevated rounded text-xs">⌘ S</kbd> Save</div>
                  <div><kbd className="px-1 py-0.5 bg-elevated rounded text-xs">⌘ ⏎</kbd> Publish</div>
                  <div><kbd className="px-1 py-0.5 bg-elevated rounded text-xs">F11</kbd> Fullscreen</div>
                  <div><kbd className="px-1 py-0.5 bg-elevated rounded text-xs">Esc</kbd> Exit</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Editor Container */}
          <div className={`transition-all duration-300 ${focusMode ? 'bg-transparent' : 'bg-surface rounded-xl border border-border-primary'} ${isFullscreen ? 'h-[calc(100vh-3.5rem)]' : ''}`}>
            <PostForm
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              imageTitle={imageTitle}
              setImageTitle={setImageTitle}
              focusMode={focusMode}
              isFullscreen={isFullscreen}
            />
          </div>

          {/* Mobile Stats */}
          <div className="md:hidden flex items-center justify-center space-x-6 mt-4 text-sm text-muted">
            <div className="flex items-center space-x-2">
              <FaFileAlt className="w-4 h-4" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaClock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
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
  );
};

export default Write;
