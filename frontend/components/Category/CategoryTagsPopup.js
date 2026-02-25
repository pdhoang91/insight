// components/Category/CategoryTagsPopup.js — Medium-style full-page publish flow
import React, { useState, useRef, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useCategories } from '../../hooks/useCategories';
import { getContentPlainText } from '../../utils/renderContent';

const CategoryTagsPopup = ({ title, content, imageTitle, onPublish, onCancel }) => {
  const { categories, isLoading } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef(null);

  const autoExcerpt = useMemo(() => {
    const plain = getContentPlainText(content);
    return plain?.substring(0, 160) || '';
  }, [content]);

  const [excerpt, setExcerpt] = useState('');
  const displayExcerpt = excerpt || autoExcerpt;

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
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-medium-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 text-medium-text-muted hover:text-medium-text-primary transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-opacity ${
              canPublish
                ? 'bg-medium-accent-green text-white hover:opacity-90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Publish now
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left — Story preview */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-medium-text-muted uppercase tracking-wider mb-6">
              Story Preview
            </h2>

            {/* Cover image */}
            {imageTitle ? (
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-medium-bg-secondary mb-6">
                <img src={imageTitle} alt="Cover" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-lg bg-medium-bg-secondary mb-6 flex items-center justify-center">
                <p className="text-sm text-medium-text-muted">No cover image</p>
              </div>
            )}

            {/* Title preview */}
            <h3 className="font-serif text-2xl font-bold text-medium-text-primary mb-3 line-clamp-2">
              {title || 'Untitled'}
            </h3>

            {/* Editable excerpt */}
            <div>
              <label className="text-xs text-medium-text-muted mb-1 block">
                Subtitle / Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={autoExcerpt || 'Write a preview subtitle...'}
                className="w-full text-sm text-medium-text-secondary leading-relaxed resize-none border-0 border-b border-medium-border focus:border-[#242424] focus:outline-none py-2 bg-transparent placeholder:text-medium-text-muted/60"
                rows={3}
                maxLength={280}
              />
              <div className="text-xs text-medium-text-muted mt-1 text-right">
                {(excerpt || autoExcerpt).length}/280
              </div>
              <p className="text-xs text-medium-text-muted mt-3 leading-relaxed">
                Changes here will affect how your story appears in public places like the homepage and in subscribers' inboxes — not the contents of the story itself.
              </p>
            </div>
          </div>

          {/* Right — Publishing options */}
          <div className="lg:w-[340px] flex-shrink-0">
            <h2 className="text-sm font-semibold text-medium-text-muted uppercase tracking-wider mb-6">
              Publishing Options
            </h2>

            {/* Categories */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-medium-text-primary">
                  Topic
                </label>
                <span className="text-xs text-medium-text-muted">
                  {selectedCategories.length}/3
                </span>
              </div>
              <p className="text-xs text-medium-text-muted mb-3">
                Add up to 3 topics so readers can find your story.
              </p>
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
                            ? 'bg-[#242424] text-white border-[#242424]'
                            : isDisabled
                            ? 'border-medium-border text-medium-text-muted opacity-40 cursor-not-allowed'
                            : 'border-[#b3b3b1] text-[#6b6b6b] hover:border-[#242424] hover:text-[#242424]'
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
                <label className="text-sm font-medium text-medium-text-primary">
                  Tags
                </label>
                <span className="text-xs text-medium-text-muted">
                  {tags.length}/5
                </span>
              </div>
              <p className="text-xs text-medium-text-muted mb-3">
                Add tags (up to 5) to help categorize your story.
              </p>
              <div
                className="flex flex-wrap items-center gap-2 px-3 py-2 border border-[#b3b3b1] rounded-lg focus-within:border-[#242424] transition-colors min-h-[42px]"
                onClick={() => tagInputRef.current?.focus()}
              >
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2.5 py-1 bg-medium-bg-secondary text-medium-text-primary text-sm rounded-full"
                  >
                    {tag}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                      className="text-medium-text-muted hover:text-medium-text-primary transition-colors"
                    >
                      <FaTimes className="w-2.5 h-2.5" />
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
                    placeholder={tags.length === 0 ? 'Add a tag...' : ''}
                    className="flex-1 min-w-[100px] text-sm outline-none bg-transparent text-medium-text-primary placeholder:text-medium-text-muted"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTagsPopup;
