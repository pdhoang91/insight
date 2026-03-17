// components/Editor/TitleInput.js
import React, { useRef, useEffect } from 'react';
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
  const textareaRef = useRef(null);

  return (
    <div className="group/title mb-8">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        placeholder="Title"
        className="title-textarea w-full bg-transparent border-none outline-none resize-none font-serif text-[42px] font-bold text-[#292929] leading-[1.25] tracking-[-0.011em] py-0 min-h-[52px]"
        rows={1}
        autoFocus
      />

      {imageTitle ? (
        <div className="relative mt-6">
          <img
            src={imageTitle}
            alt="Cover"
            className="w-full max-h-[400px] object-cover rounded"
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
          className="title-cover-btn mt-2 flex items-center gap-2 text-sm text-[#b3b3b1] hover:text-[#757575] transition-all duration-200"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <FaImage className="w-3.5 h-3.5" />
              <span>Add a cover image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TitleInput;
