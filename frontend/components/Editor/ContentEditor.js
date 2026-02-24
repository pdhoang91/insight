// components/Editor/ContentEditor.js
import React from 'react';
import { EditorContent } from '@tiptap/react';
import LoadingSpinner from '../Shared/LoadingSpinner';

const ContentEditor = ({ editor, isUploading }) => {
  return (
    <div className="relative min-h-[500px]">
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-medium-text-secondary">
              Uploading image...
            </p>
          </div>
        </div>
      )}

      {editor && (
        <EditorContent
          editor={editor}
          className="prose-editor editor-scroll min-h-[400px] outline-none focus:outline-none"
        />
      )}
    </div>
  );
};

export default ContentEditor;
