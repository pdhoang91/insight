'use client';

import React, { useRef, useState } from 'react';
import { PostForm } from '@/types';

interface PostEditorProps {
  postData: PostForm;
  setPostData: React.Dispatch<React.SetStateAction<PostForm>>;
}

const PostEditor: React.FC<PostEditorProps> = ({ postData, setPostData }) => {
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostData(prev => ({ ...prev, title: e.target.value }));
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostData(prev => ({ ...prev, content: e.target.value }));
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImageUploading(true);
      
      // Create a URL for preview
      const imageUrl = URL.createObjectURL(file);
      setPostData(prev => ({ ...prev, image: imageUrl }));
      
      // TODO: Implement actual image upload to server
      setTimeout(() => {
        setIsImageUploading(false);
      }, 1000);
    }
  };

  const removeImage = () => {
    setPostData(prev => ({ ...prev, image: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Image Upload Section */}
      {postData.image ? (
        <div className="relative">
          <img
            src={typeof postData.image === 'string' ? postData.image : URL.createObjectURL(postData.image)}
            alt="Post cover"
            className="w-full h-64 object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onClick={triggerImageUpload}
          className="h-32 bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm text-gray-500">Click to add a cover image</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor Content */}
      <div className="p-8">
        {/* Title Input */}
        <textarea
          value={postData.title}
          onChange={handleTitleChange}
          placeholder="Title"
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none resize-none focus:outline-none bg-transparent"
          rows={1}
          style={{ minHeight: '60px' }}
        />

        {/* Content Input */}
        <textarea
          value={postData.content}
          onChange={handleContentChange}
          placeholder="Tell your story..."
          className="w-full mt-8 text-lg text-gray-700 placeholder-gray-400 border-none resize-none focus:outline-none bg-transparent leading-relaxed"
          rows={20}
          style={{ minHeight: '500px' }}
        />

        {/* Toolbar */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={triggerImageUpload}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Add Image</span>
            </button>

            <div className="text-sm text-gray-500">
              {postData.content.length} characters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor; 