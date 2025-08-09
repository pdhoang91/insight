// components/Editor/TitleInput.js
import React from 'react';
import { FaUpload, FaImage } from 'react-icons/fa';
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
          className={`w-full bg-transparent border-0 border-b-2 border-border-primary focus:border-primary outline-none transition-all duration-200 resize-none ${
            focusMode 
              ? 'text-3xl md:text-4xl lg:text-5xl py-4 placeholder-text-muted/50' 
              : 'text-2xl md:text-3xl py-3 placeholder-text-muted'
          } text-primary font-bold leading-tight`}
          placeholder="Your story title..."
          style={{ fontFamily: 'var(--font-primary)' }}
        />
        
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleImageTitleUpload}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-secondary hover:text-primary rounded-lg transition-colors ${
            focusMode ? 'opacity-60 hover:opacity-100' : ''
          }`}
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
            <FaUpload className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Cover Image Preview */}
      {imageTitle && (
        <div className={`relative ${focusMode ? 'opacity-80' : ''}`}>
          <img
            src={imageTitle}
            alt="Cover image preview"
            className="w-full max-h-64 object-cover rounded-lg border border-border-primary"
          />
          <button
            onClick={() => setImageTitle(null)}
            className="absolute top-2 right-2 p-1 bg-surface/80 backdrop-blur-sm text-secondary hover:text-danger rounded-full transition-colors"
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
