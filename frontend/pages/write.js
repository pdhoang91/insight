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
import { FaRobot, FaArrowLeft } from 'react-icons/fa';

const Write = () => {
  const router = useRouter();
  const { user, setModalOpen, loading } = useUser();
  const { setHandlePublish, setHandleUpdate } = usePostContext();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageTitle, setImageTitle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

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

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please add a title and content to your post');
      return;
    }
    setShowPopup(true);
  };

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

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved!';
      case 'error': return 'Error saving';
      default: return 'Save Draft';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-blue-600';
      case 'saved': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-300 font-mono">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800 border-b border-gray-700 sticky top-16 z-30 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Go back"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white font-mono">Write Your Story</h1>
                <p className="text-sm text-gray-400 font-mono">// share your thoughts with the world</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                href="/aiwrite" 
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all duration-200" 
                title="AI Writing Assistant"
              >
                <FaRobot className="w-5 h-5" />
              </Link>

              <span className={`text-sm font-mono ${getSaveStatusColor()}`}>
                {getSaveStatusText()}
              </span>
              
              <Button
                onClick={handleSaveDraft}
                variant="ghost"
                size="sm"
                disabled={saveStatus === 'saving'}
                className="text-gray-400 hover:text-gray-200 font-mono"
              >
                {saveStatus === 'saving' && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                save_draft()
              </Button>
              
              <Button
                onClick={handlePublish}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-gray-900 font-mono font-medium px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                publish()
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Welcome Message for New Users */}
        {!title && !content && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl border border-gray-600"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white font-mono">Ready to share your story?</h2>
            </div>
            <p className="text-gray-300 leading-relaxed font-mono text-sm">
              // Welcome to your writing space! Start with a compelling title and let your thoughts flow.<br/>
              // Your story could inspire, educate, or entertain thousands of readers.
            </p>
          </motion.div>
        )}

        {/* Editor Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden"
        >
          <PostForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            imageTitle={imageTitle}
            setImageTitle={setImageTitle}
          />
        </motion.div>

        {/* Writing Tips */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-all">
            <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2 font-mono">start_strong()</h3>
            <p className="text-sm text-gray-300">Hook your readers with an engaging opening that makes them want to continue reading.</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-all">
            <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2 font-mono">be_authentic()</h3>
            <p className="text-sm text-gray-300">Write in your own voice. Authenticity resonates with readers and builds trust.</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-all">
            <div className="w-8 h-8 bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2 font-mono">add_value()</h3>
            <p className="text-sm text-gray-300">Share insights, experiences, or knowledge that can help or inspire your readers.</p>
          </div>
        </motion.div>
      </motion.div>

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
