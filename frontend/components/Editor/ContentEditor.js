// components/Editor/ContentEditor.js
import React from 'react';
import { EditorContent } from '@tiptap/react';
import { themeClasses, combineClasses } from '../../utils/themeClasses';
import LoadingSpinner from '../Shared/LoadingSpinner';

const ContentEditor = ({
  editor,
  content,
  isUploading,
}) => {
  return (
    <div className={combineClasses(
      'relative min-h-[500px]',
      themeClasses.spacing.container,
      themeClasses.animations.smooth
    )}>
      
      {isUploading && (
        <div className={combineClasses(
          'absolute inset-0 flex items-center justify-center z-10',
          'bg-medium-bg-primary/50',
          themeClasses.effects.blur,
          themeClasses.effects.rounded
        )}>
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className={combineClasses(
              'mt-2',
              themeClasses.typography.bodySmall,
              themeClasses.text.secondary
            )}>
              Uploading image...
            </p>
          </div>
        </div>
      )}
      
      {editor && (
        <div className="h-full">
          <EditorContent 
            editor={editor} 
            className={combineClasses(
              'prose-editor editor-scroll min-h-[400px]',
              'outline-none focus:outline-none',
              themeClasses.typography.bodyMedium
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ContentEditor;
