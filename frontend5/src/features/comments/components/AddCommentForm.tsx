'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui';
import { SafeImage } from '@/components/ui';

interface AddCommentFormProps {
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Write a comment...',
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    onSubmit(content.trim());
    setContent('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <SafeImage
            src={user?.avatar}
            alt={user?.username || 'User'}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>

        {/* Form */}
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows={3}
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Be respectful and constructive in your comments.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner />
                  <span>Posting...</span>
                </div>
              ) : (
                'Post Comment'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default AddCommentForm; 