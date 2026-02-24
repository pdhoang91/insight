// components/Editor/TitleInput.js
import React from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../Shared/LoadingSpinner';

const TitleInput = ({
  title,
  setTitle,
  imageTitle,
  setImageTitle,
  handleImageTitleUpload,
  isUploadingTitle,
}) => {
  return (
    <div className="mb-8">
      {/* Title */}
      <textarea
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        placeholder="Title"
        className="w-full bg-transparent border-0 outline-none resize-none font-serif text-4xl font-bold text-medium-text-primary placeholder:text-medium-text-muted/50 leading-tight"
        rows={1}
      />

      {/* Cover image */}
      {imageTitle ? (
        <div className="relative mt-6">
          <img
            src={imageTitle}
            alt="Cover"
            className="w-full max-h-[400px] object-cover rounded-lg"
          />
          <button
            onClick={() => setImageTitle(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Xóa ảnh bìa"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleImageTitleUpload}
          disabled={isUploadingTitle}
          className="mt-4 flex items-center gap-2 text-sm text-medium-text-muted hover:text-medium-accent-green transition-colors"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <FaImage className="w-4 h-4" />
              <span>Add cover image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TitleInput;
