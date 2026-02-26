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
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
        <div className="max-w-[1032px] mx-auto px-6 flex items-center justify-between h-14">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 text-[#6b6b6b] hover:text-[#292929] transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className={`px-5 py-2 text-sm rounded-full transition-all ${
              canPublish
                ? 'bg-[#1a8917] text-white hover:bg-[#156d12]'
                : 'bg-[#e6e6e6] text-[#b3b3b1] cursor-not-allowed'
            }`}
          >
            Publish now
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1032px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">
          {/* Left — Story preview */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#6b6b6b] tracking-wide mb-4">
              Story Preview
            </p>

            {imageTitle ? (
              <div className="aspect-[16/9] overflow-hidden bg-[#fafafa] mb-5">
                <img src={imageTitle} alt="Cover" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[16/9] bg-[#fafafa] mb-5 flex items-center justify-center border border-dashed border-[#e0e0e0]">
                <p className="text-sm text-[#b3b3b1]">
                  Include a high-quality image in your story to make it more inviting to readers.
                </p>
              </div>
            )}

            <h3 className="font-serif text-[22px] font-bold text-[#242424] mb-2 leading-tight">
              {title || 'Untitled'}
            </h3>

            <div className="mt-4">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={autoExcerpt || 'Write a preview subtitle...'}
                className="w-full text-[14px] text-[#6b6b6b] leading-relaxed resize-none border-0 border-b border-[#e6e6e6] focus:border-[#292929] focus:outline-none py-2 bg-transparent placeholder:text-[#b3b3b1]"
                rows={2}
                maxLength={280}
              />
              <p className="text-[12px] text-[#b3b3b1] mt-2 leading-relaxed">
                Write a preview subtitle that will appear on the homepage and in emails.
                <span className="float-right">{displayExcerpt.length}/280</span>
              </p>
            </div>
          </div>

          {/* Right — Publishing options */}
          <div className="lg:w-[320px] flex-shrink-0">
            {/* Topics */}
            <div className="mb-10">
              <p className="text-[13px] font-medium text-[#6b6b6b] tracking-wide mb-2">
                Publishing to: <span className="font-bold text-[#292929]">Your blog</span>
              </p>
              <p className="text-[13px] text-[#6b6b6b] mb-4">
                Add or change topics (up to 3) so readers know what your story is about.
              </p>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-[#f2f2f2] rounded animate-pulse" />
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
                        className={`px-3 py-1.5 text-[13px] rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-[#292929] text-white border-[#292929]'
                            : isDisabled
                            ? 'border-[#e6e6e6] text-[#c2c2c2] cursor-not-allowed'
                            : 'border-[#c2c2c2] text-[#6b6b6b] hover:border-[#292929] hover:text-[#292929]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedCategories.length > 0 && (
                <p className="text-[12px] text-[#b3b3b1] mt-3">
                  {selectedCategories.length}/3 selected
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <p className="text-[13px] font-medium text-[#6b6b6b] tracking-wide mb-2">
                Tags
              </p>
              <p className="text-[13px] text-[#6b6b6b] mb-4">
                Add up to 5 tags to help categorize your story.
              </p>
              <div
                className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 border border-[#c2c2c2] rounded focus-within:border-[#292929] transition-colors min-h-[44px] cursor-text"
                onClick={() => tagInputRef.current?.focus()}
              >
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#f2f2f2] text-[#292929] text-[13px] rounded"
                  >
                    {tag}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                      className="text-[#b3b3b1] hover:text-[#292929] transition-colors ml-0.5"
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
                    className="flex-1 min-w-[80px] text-[13px] outline-none bg-transparent text-[#292929] placeholder:text-[#b3b3b1]"
                  />
                )}
              </div>
              {tags.length > 0 && (
                <p className="text-[12px] text-[#b3b3b1] mt-2">
                  {tags.length}/5 tags
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTagsPopup;
