// components/Editor/ContentEditor.js
import React from 'react';
import { EditorContent } from '@tiptap/react';
import LoadingSpinner from '../Shared/LoadingSpinner';
import PreviewContent from './PreviewContent';

const ContentEditor = ({
  editor,
  isPreview,
  content,
  isUploading,
  focusMode = false,
  isFullscreen = false,
}) => {
  return (
    <div className={`relative transition-all duration-300 ${
      focusMode 
        ? 'px-0' 
        : 'px-4'
    } ${isFullscreen ? 'h-full' : 'min-h-[500px]'}`}>
      
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm rounded-lg z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-secondary">Uploading image...</p>
          </div>
        </div>
      )}
      
      {editor && (
        <div className="h-full">
          {isPreview ? (
            <div className={`prose prose-lg max-w-none ${focusMode ? 'prose-xl' : ''}`}>
              <PreviewContent content={content} />
            </div>
          ) : (
            <EditorContent 
              editor={editor} 
              className={`
                prose-editor editor-scroll min-h-[400px] outline-none
                ${focusMode ? 'focus-mode' : ''}
                ${isFullscreen ? 'h-full' : ''}
                focus:outline-none
              `}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ContentEditor;
