// components/Editor/TitleInput.js
import React from 'react';
import { FaImage } from 'react-icons/fa';
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
          className={`w-full bg-transparent border-0 border-b border-medium-border focus:border-medium-accent-green outline-none transition-all duration-200 resize-none text-xl md:text-2xl py-3 placeholder-medium-text-muted text-medium-text-primary font-serif font-bold leading-tight`}
          placeholder="Tiêu đề bài viết của bạn..."
          style={{ fontFamily: 'var(--font-primary)' }}
        />
        
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleImageTitleUpload}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-medium-text-secondary hover:text-medium-accent-green rounded-lg transition-colors`}
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
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-medium-accent-green rounded-full flex items-center justify-center">
                <FaImage className="w-1.5 h-1.5 text-white" />
              </div>
            </div>
          ) : (
            <FaImage className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Cover Image Preview */}
      {imageTitle && (
        <div className={`relative`}>
          <img
            src={imageTitle}
            alt="Xem trước ảnh bìa"
            className="w-full max-h-64 object-cover rounded-lg border border-medium-border"
          />
          <button
            onClick={() => setImageTitle(null)}
            className="absolute top-2 right-2 p-1 /80 backdrop-blur-sm text-medium-text-secondary hover:text-red-500 rounded-full transition-colors"
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
