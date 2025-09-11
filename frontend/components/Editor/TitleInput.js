// components/Editor/TitleInput.js
import React from 'react';
import { FaImage } from 'react-icons/fa';
import { themeClasses, combineClasses, componentClasses } from '../../utils/themeClasses';
import LoadingSpinner from '../Shared/LoadingSpinner';

const TitleInput = ({
  title,
  setTitle,
  imageTitle,
  setImageTitle,
  handleImageTitleUpload,
  isUploadingTitle,
  focusMode = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={combineClasses(
            'w-full bg-transparent border-0 border-b py-3',
            'border-medium-border focus:border-medium-accent-green',
            'outline-none resize-none',
            themeClasses.typography.h3,
            themeClasses.text.primary,
            'placeholder-medium-text-muted',
            themeClasses.animations.smooth
          )}
          placeholder="Tiêu đề bài viết của bạn..."
        />
        
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleImageTitleUpload}
          className={combineClasses(
            'absolute right-0 top-1/2 transform -translate-y-1/2',
            themeClasses.interactive.touchTarget,
            'p-2 rounded-lg',
            themeClasses.text.secondary,
            'hover:text-medium-accent-green',
            themeClasses.animations.smooth
          )}
          aria-label="Tải lên ảnh bìa"
          title="Tải lên ảnh bìa"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="sm" />
          ) : imageTitle ? (
            <div className="relative">
              <img
                src={imageTitle}
                alt="Ảnh bìa"
                className="w-6 h-6 object-cover rounded"
              />
              <div className={combineClasses(
                'absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center',
                'bg-medium-accent-green text-white'
              )}>
                <FaImage className="w-1.5 h-1.5" />
              </div>
            </div>
          ) : (
            <FaImage className={themeClasses.icons.sm} />
          )}
        </button>
      </div>

      {/* Cover Image Preview */}
      {imageTitle && (
        <div className={`relative`}>
          <img
            src={imageTitle}
            alt="Xem trước ảnh bìa"
            className={combineClasses(
              'w-full max-h-64 object-cover border border-medium-border',
              themeClasses.effects.rounded
            )}
          />
          <button
            onClick={() => setImageTitle(null)}
            className={combineClasses(
              'absolute top-2 right-2 p-1 rounded-full',
              'bg-medium-bg-primary/80',
              themeClasses.effects.blur,
              themeClasses.text.secondary,
              'hover:text-red-500',
              themeClasses.animations.smooth
            )}
            title="Xóa ảnh bìa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default TitleInput;
