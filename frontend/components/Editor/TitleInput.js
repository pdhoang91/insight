// components/Editor/TitleInput.js
import React from 'react';
import { FaUpload } from 'react-icons/fa';
import LoadingSpinner from '../Shared/LoadingSpinner';

const TitleInput = ({
  title,
  setTitle,
  imageTitle,
  handleImageTitleUpload,
  isUploadingTitle,
}) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full pr-10 p-3 border border-gray-300 rounded text-gray-500 italic focus:outline-none focus:border-blue-500"
          placeholder="Tiêu đề bài viết..."
        />
        <button
          type="button"
          onClick={handleImageTitleUpload}
          className="absolute right-0 top-0 mt-3 mr-3 text-gray-500 hover:text-blue-500"
          aria-label="Upload Image Title"
          title="Tải lên ảnh tiêu đề"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="h-5 w-5" color="text-blue-500" />
          ) : imageTitle ? (
            <img
              src={imageTitle}
              alt="Image Title"
              className="w-5 h-5 object-cover rounded-full"
            />
          ) : (
            <FaUpload />
          )}
        </button>
      </div>
    </div>
  );
};

export default TitleInput;
