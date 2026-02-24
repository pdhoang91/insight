// components/Category/CategoryTagsPopup.js
import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useCategories } from '../../hooks/useCategories';

const CategoryTagsPopup = ({ title, content, imageTitle, onPublish, onCancel }) => {
  const { categories, isLoading } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef(null);

  const toggleCategory = (category) => {
    const isSelected = selectedCategories.some(c => c.id === category.id);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    const categoryNames = selectedCategories.map(c => c.name).join(',');
    const finalTags = tags.join(',');
    onPublish(categoryNames, finalTags);
  };

  const canPublish = selectedCategories.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="max-w-lg w-full mx-4 bg-white rounded-xl shadow-xl border border-medium-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-medium-border">
          <h3 className="font-serif text-lg font-bold text-medium-text-primary">
            Publish Article
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-medium-text-muted hover:text-medium-text-primary transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-medium-text-primary">
                Categories
              </label>
              <span className="text-xs text-medium-text-muted">
                {selectedCategories.length}/3
              </span>
            </div>
            {isLoading ? (
              <div className="flex gap-2 flex-wrap">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-medium-bg-secondary rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories?.map((cat) => {
                  const isSelected = selectedCategories.some(c => c.id === cat.id);
                  const isDisabled = !isSelected && selectedCategories.length >= 3;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => !isDisabled && toggleCategory(cat)}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-medium-accent-green text-white border-medium-accent-green'
                          : isDisabled
                          ? 'border-medium-border text-medium-text-muted opacity-40 cursor-not-allowed'
                          : 'border-medium-border text-medium-text-secondary hover:border-medium-accent-green hover:text-medium-accent-green'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-medium-text-primary">
                Tags
              </label>
              <span className="text-xs text-medium-text-muted">
                {tags.length}/5
              </span>
            </div>
            <div
              className="flex flex-wrap items-center gap-2 px-3 py-2 border border-medium-border rounded-lg focus-within:ring-2 focus-within:ring-medium-accent-green/30 focus-within:border-medium-accent-green transition-all min-h-[42px]"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 bg-medium-accent-green/10 text-medium-accent-green text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                    className="hover:text-red-500 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? 'Type a tag and press Enter...' : ''}
                  className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-medium-text-primary placeholder:text-medium-text-muted"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-medium-border">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm font-medium text-medium-text-secondary hover:text-medium-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
              canPublish
                ? 'bg-medium-accent-green text-white hover:opacity-90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTagsPopup;
