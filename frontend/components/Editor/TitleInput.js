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
    <div className="mb-6">
      <textarea
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        placeholder="Title"
        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#e6e6e6] outline-none resize-none font-serif text-[42px] font-bold text-[#292929] placeholder:text-[#9a9a9a] leading-[1.15] tracking-tight transition-colors pb-2"
        rows={1}
      />

      {imageTitle ? (
        <div className="relative mt-6">
          <img
            src={imageTitle}
            alt="Cover"
            className="w-full max-h-[400px] object-cover"
          />
          <button
            onClick={() => setImageTitle(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleImageTitleUpload}
          disabled={isUploadingTitle}
          className="mt-3 flex items-center gap-2 text-sm text-[#b3b3b1] hover:text-[#757575] transition-colors"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <FaImage className="w-4 h-4" />
              <span>Add a cover image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TitleInput;
