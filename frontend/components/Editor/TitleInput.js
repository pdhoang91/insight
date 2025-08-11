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
          className={`w-full bg-transparent border-0 border-b border-border-primary/50 focus:border-border-primary outline-none transition-all duration-200 resize-none text-xl md:text-2xl py-3 placeholder-text-muted text-text-primary font-semibold leading-tight`}
          placeholder="Your story title..."
          style={{ fontFamily: 'var(--font-primary)' }}
        />
        
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleImageTitleUpload}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-text-secondary hover:text-primary rounded-lg transition-colors`}
          aria-label="Upload cover image"
          title="Upload cover image"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="sm" />
          ) : imageTitle ? (
            <div className="relative">
              <img
                src={imageTitle}
                alt="Cover image"
                className="w-6 h-6 object-cover rounded"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
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
            alt="Cover image preview"
            className="w-full max-h-64 object-cover rounded-lg border border-border-primary/50"
          />
          <button
            onClick={() => setImageTitle(null)}
            className="absolute top-2 right-2 p-1 bg-surface/80 backdrop-blur-sm text-text-secondary hover:text-red-400 rounded-full transition-colors"
            title="Remove cover image"
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
