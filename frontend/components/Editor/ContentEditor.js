// components/Editor/ContentEditor.js
import React from 'react';
import { EditorContent } from '@tiptap/react';
import LoadingSpinner from '../Shared/LoadingSpinner';

const ContentEditor = ({ editor, isUploading, uploadingText = 'Uploading image...' }) => {
  return (
    <div style={{ position: 'relative', minHeight: '500px' }}>
      {isUploading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: 'rgba(242, 237, 228, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '4px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner size="lg" />
            <p style={{ marginTop: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {uploadingText}
            </p>
          </div>
        </div>
      )}

      {editor && (
        <EditorContent
          editor={editor}
          className="prose-editor editor-scroll"
          style={{ minHeight: '400px', outline: 'none' }}
        />
      )}
    </div>
  );
};

export default ContentEditor;
