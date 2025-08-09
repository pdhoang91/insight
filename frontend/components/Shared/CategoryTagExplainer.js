// components/Shared/CategoryTagExplainer.js
import React, { useState } from 'react';
import { FaCode, FaBolt, FaInfoCircle, FaTimes } from 'react-icons/fa';

const CategoryTagExplainer = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-gray-900">Categories vs Tags</h3>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-3">
            <FaCode className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Categories</h4>
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              Admin Curated
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Organized topics curated by our editorial team to help you find content by broad subject areas.
          </p>
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium">Examples:</div>
            <div className="flex flex-wrap gap-1">
              <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">Frontend</span>
              <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">Backend</span>
              <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">DevOps</span>
              <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">Mobile</span>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-lg p-4 border border-orange-100">
          <div className="flex items-center space-x-2 mb-3">
            <FaBolt className="w-4 h-4 text-orange-600" />
            <h4 className="font-semibold text-gray-900">Tags</h4>
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              User Generated
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Specific keywords and technologies added by authors to describe their content in detail.
          </p>
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium">Examples:</div>
            <div className="flex flex-wrap gap-1">
              <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded">#react</span>
              <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded">#nextjs</span>
              <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded">#typescript</span>
              <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded">#tutorial</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Pro tip:</strong> Use categories to browse by topic area, and tags to find specific technologies or concepts.
          When writing, choose 1-2 categories and add 3-5 relevant tags.
        </p>
      </div>
    </div>
  );
};

export default CategoryTagExplainer; 