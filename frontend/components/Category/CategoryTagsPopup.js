// components/Category/CategoryTagsPopup.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaTag, FaFolderOpen, FaPaperPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '../Utils/SafeImage';

const CategoryTagsPopup = ({ title, content, imageTitle, onPublish, onCancel }) => {
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-surface rounded-xl shadow-xl border border-border-primary w-11/12 max-w-4xl mx-auto relative overflow-hidden max-h-[90vh]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-primary">
            <h2 className="text-2xl font-bold text-primary">Ready to Publish?</h2>
            <button
              className="p-2 text-muted hover:text-secondary rounded-lg hover:bg-elevated transition-colors"
              onClick={onCancel}
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Preview Section */}
            <div className="w-full lg:w-1/2 p-6 border-r border-border-primary">
              <h3 className="text-lg font-semibold mb-4 text-secondary">Story Preview</h3>
              <div className="bg-elevated rounded-lg p-4 border border-border-primary">
                {/* Image Preview */}
                {imageTitle && (
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <SafeImage
                      src={imageTitle}
                      alt="Post cover"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                
                {/* Title */}
                <h4 className="text-xl font-bold text-primary mb-3 line-clamp-2">
                  {title || 'Untitled Story'}
                </h4>
                
                {/* Content Preview */}
                <div className="text-secondary text-sm leading-relaxed line-clamp-4 mb-4">
                  {getLimitedContent(content, 200)}
                </div>
                
                {/* Tip */}
                <div className="bg-primary/5 rounded-lg p-3 border-l-4 border-primary">
                  <p className="text-xs text-muted">
                    💡 <strong>Tip:</strong> A compelling cover image helps your story stand out and attract more readers.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-1/2 p-6">
              <h3 className="text-lg font-semibold mb-6 text-secondary">Add Categories & Tags</h3>
              
              {/* Categories Input */}
              <div className="mb-6">
                <label className="flex items-center mb-3 font-medium text-primary">
                  <FaFolderOpen className="w-4 h-4 mr-2 text-primary" />
                  Categories
                </label>
                <input
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  className="w-full p-3 bg-elevated border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-primary placeholder-muted"
                  placeholder="e.g., Technology, Science, Programming"
                  aria-label="Enter Categories"
                />
                <p className="text-xs text-muted mt-2">
                  Separate multiple categories with commas
                </p>
              </div>

              {/* Tags Input */}
              <div className="mb-8">
                <label className="flex items-center mb-3 font-medium text-primary">
                  <FaTag className="w-4 h-4 mr-2 text-primary" />
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full p-3 bg-elevated border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-primary placeholder-muted"
                  placeholder="e.g., React, JavaScript, Web Development"
                  aria-label="Enter Tags"
                />
                <p className="text-xs text-muted mt-2">
                  Help readers discover your content with relevant tags
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onPublish(categories, tags)}
                  className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  aria-label="Publish Story"
                >
                  <FaPaperPlane className="w-4 h-4 mr-2" />
                  Publish Story
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center justify-center px-6 py-3 bg-elevated text-secondary border border-border-primary rounded-lg hover:bg-surface hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-border-primary font-medium"
                  aria-label="Cancel"
                >
                  <FaTimes className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper function to limit content length
const getLimitedContent = (content, maxLength) => {
  if (!content) return 'No content preview available...';
  const strippedContent = content.replace(/<[^>]+>/g, ''); // Remove HTML tags
  return strippedContent.length > maxLength
    ? strippedContent.substring(0, maxLength) + '...'
    : strippedContent;
};

export default CategoryTagsPopup;
