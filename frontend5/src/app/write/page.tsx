'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import PostEditor from '@/features/posts/components/PostEditor';
import PublishModal from '@/features/posts/components/PublishModal';
import { PostForm } from '@/types';
import { LoadingSpinner, Button } from '@/components/ui';

export default function WritePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { isOpen: isPublishModalOpen, openModal: openPublishModal, closeModal: closePublishModal } = useModal();
  
  const [postData, setPostData] = useState<PostForm>({
    title: '',
    content: '',
    excerpt: '',
    image: undefined,
    categories: [],
    tags: [],
    status: 'draft',
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handlePublish = () => {
    if (!postData.title.trim() || !postData.content.trim()) {
      alert('Please add a title and content to your post');
      return;
    }
    openPublishModal();
  };

  const handleSaveDraft = async () => {
    try {
      setSaveStatus('saving');
      // TODO: Implement save draft functionality
      console.log('Save draft:', postData);
      
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Write Your Story</h1>
                <p className="text-sm text-gray-500">Share your thoughts with the world</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${getSaveStatusColor()}`}>
                {getSaveStatusText()}
              </span>
              
              <Button
                onClick={handleSaveDraft}
                variant="ghost"
                size="sm"
                disabled={saveStatus === 'saving'}
                className="text-gray-600 hover:text-gray-800"
              >
                {saveStatus === 'saving' && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                Save Draft
              </Button>
              
              <Button
                onClick={handlePublish}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                Publish
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
        {!postData.title && !postData.content && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Ready to share your story?</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Welcome to your writing space! Start with a compelling title and let your thoughts flow. 
              Your story could inspire, educate, or entertain thousands of readers.
            </p>
          </motion.div>
        )}

        {/* Editor Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <PostEditor postData={postData} setPostData={setPostData} />
        </motion.div>

        {/* Writing Tips */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start Strong</h3>
            <p className="text-sm text-gray-600">Hook your readers with an engaging opening that makes them want to continue reading.</p>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Be Authentic</h3>
            <p className="text-sm text-gray-600">Write in your own voice. Authenticity resonates with readers and builds trust.</p>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Add Value</h3>
            <p className="text-sm text-gray-600">Share insights, experiences, or knowledge that can help or inspire your readers.</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={closePublishModal}
        postData={postData}
        setPostData={setPostData}
      />
    </div>
  );
} 