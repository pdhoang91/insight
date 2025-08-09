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
}) => {
  return (
    <div className="p-4 relative editor-content content">
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <LoadingSpinner size="h-8 w-8" color="text-blue-500" />
        </div>
      )}
      {editor && (
        <>
          {isPreview ? (
            <PreviewContent content={content} />
          ) : (
            <EditorContent editor={editor} className="min-h-[300px] focus:outline-none prose content" />
          )}
        </>
      )}
    </div>
  );
};

export default ContentEditor;
