// components/Category/CategoryTagsPopup.js — Medium-style full-page publish flow
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { X, Image, ArrowCircleUp } from '@phosphor-icons/react';
import { useCategories } from '../../hooks/useCategories';
import { getContentPlainText } from '../../utils/renderContent';
import { uploadImage } from '../../services/imageService';
import LoadingSpinner from '../Shared/LoadingSpinner';

const CategoryTagsPopup = ({ title, content, imageTitle, setImageTitle, onPublish, onCancel }) => {
  const { categories, isLoading } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const tagInputRef = useRef(null);

  const autoExcerpt = useMemo(() => {
    const plain = getContentPlainText(content);
    return plain?.substring(0, 160) || '';
  }, [content]);

  const [excerpt, setExcerpt] = useState('');
  const displayExcerpt = excerpt || autoExcerpt;

  const handleCoverUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setIsUploadingCover(true);
      try {
        const url = await uploadImage(file, 'title');
        setImageTitle(url);
      } catch (err) {
        console.error('Cover upload failed', err);
      } finally {
        setIsUploadingCover(false);
      }
    };
  }, [setImageTitle]);

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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--bg)',
        overflowY: 'auto',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(242, 237, 228, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: '1032px',
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '3.5rem',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem',
              marginLeft: '-0.5rem',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            className="hover:text-[var(--text)]"
          >
            <X size={20} weight="regular" />
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            style={{
              padding: '0.5rem 1.25rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '3px',
              border: 'none',
              cursor: canPublish ? 'pointer' : 'not-allowed',
              background: canPublish ? 'var(--accent)' : 'var(--bg-surface)',
              color: canPublish ? 'var(--text-inverse)' : 'var(--text-faint)',
              transition: 'opacity 0.2s',
              letterSpacing: '-0.01em',
            }}
            className={canPublish ? 'hover:opacity-85' : ''}
          >
            Publish now
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1032px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">
          {/* Left — Story preview */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Story Preview
            </p>

            {/* Cover image area */}
            {imageTitle ? (
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <img
                  src={imageTitle}
                  alt="Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0)',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                  }}
                  className="group hover:bg-[rgba(0,0,0,0.35)]"
                >
                  <button
                    onClick={handleCoverUpload}
                    disabled={isUploadingCover}
                    style={{
                      opacity: 0,
                      padding: '0.5rem 1rem',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'var(--text-inverse)',
                      background: 'rgba(0,0,0,0.55)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'opacity 0.2s',
                      backdropFilter: 'blur(4px)',
                    }}
                    className="group-hover:opacity-100"
                  >
                    <ArrowCircleUp size={15} weight="regular" />
                    Change
                  </button>
                  <button
                    onClick={() => setImageTitle(null)}
                    style={{
                      opacity: 0,
                      padding: '0.5rem 1rem',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'var(--text-inverse)',
                      background: 'rgba(0,0,0,0.55)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'opacity 0.2s',
                      backdropFilter: 'blur(4px)',
                    }}
                    className="group-hover:opacity-100"
                  >
                    <X size={14} weight="regular" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCoverUpload}
                disabled={isUploadingCover}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  background: 'var(--bg-surface)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  border: '1px dashed var(--border)',
                  borderRadius: '2px',
                  cursor: isUploadingCover ? 'not-allowed' : 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                  padding: 0,
                }}
                className="hover:border-[var(--border-mid)] hover:bg-[var(--bg-elevated)]"
              >
                {isUploadingCover ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Image size={22} weight="thin" color="var(--text-faint)" />
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'var(--text-faint)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Add a cover image
                    </span>
                  </>
                )}
              </button>
            )}

            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.375rem',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '0.5rem',
                lineHeight: 1.3,
              }}
            >
              {title || 'Untitled'}
            </h3>

            <div style={{ marginTop: '1rem' }}>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={autoExcerpt || 'Write a preview subtitle...'}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  resize: 'none',
                  border: 0,
                  borderBottom: '1px solid var(--border)',
                  outline: 'none',
                  padding: '0.5rem 0',
                  background: 'transparent',
                }}
                className="focus:border-[var(--border-mid)] placeholder:text-[var(--text-faint)]"
                rows={2}
                maxLength={280}
              />
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  color: 'var(--text-faint)',
                  marginTop: '0.5rem',
                  lineHeight: 1.5,
                }}
              >
                Write a preview subtitle that will appear on the homepage and in emails.
                <span style={{ float: 'right' }}>{displayExcerpt.length}/280</span>
              </p>
            </div>
          </div>

          {/* Right — Publishing options */}
          <div style={{ width: '320px', flexShrink: 0 }} className="lg:w-[320px]">
            {/* Topics */}
            <div style={{ marginBottom: '2.5rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.02em',
                  marginBottom: '0.5rem',
                }}
              >
                Publishing to: <span style={{ fontWeight: 700, color: 'var(--text)' }}>Your blog</span>
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                }}
              >
                Add or change categories (up to 3) so readers know what your story is about.
              </p>

              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: '2rem',
                        width: '6rem',
                        background: 'var(--bg-surface)',
                        borderRadius: '3px',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {categories?.map((cat) => {
                    const isSelected = selectedCategories.some(c => c.id === cat.id);
                    const isDisabled = !isSelected && selectedCategories.length >= 3;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => !isDisabled && toggleCategory(cat)}
                        disabled={isDisabled}
                        style={{
                          padding: '0.375rem 0.75rem',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          borderRadius: '3px',
                          border: `1px solid ${
                            isSelected
                              ? 'var(--accent)'
                              : isDisabled
                              ? 'var(--border)'
                              : 'var(--border-mid)'
                          }`,
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          color: isSelected ? 'var(--text-inverse)' : isDisabled ? 'var(--text-faint)' : 'var(--text-muted)',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          letterSpacing: '-0.01em',
                        }}
                        className={
                          !isSelected && !isDisabled
                            ? 'hover:border-[var(--accent)] hover:text-[var(--accent)]'
                            : ''
                        }
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedCategories.length > 0 && (
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    color: 'var(--text-faint)',
                    marginTop: '0.75rem',
                  }}
                >
                  {selectedCategories.length}/3 selected
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                Tags
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                }}
              >
                Add up to 5 tags to help categorize your story.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.625rem 0.75rem',
                  border: '1px solid var(--border-mid)',
                  borderRadius: '3px',
                  minHeight: '2.75rem',
                  cursor: 'text',
                  transition: 'border-color 0.2s',
                }}
                className="focus-within:border-[var(--accent)]"
                onClick={() => tagInputRef.current?.focus()}
              >
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.625rem',
                      background: 'var(--bg-surface)',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8125rem',
                      borderRadius: '3px',
                    }}
                  >
                    {tag}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                      style={{
                        color: 'var(--text-faint)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '0.125rem',
                        display: 'flex',
                        transition: 'color 0.2s',
                      }}
                      className="hover:text-[var(--text)]"
                    >
                      <X size={10} weight="bold" />
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
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      background: 'transparent',
                      color: 'var(--text)',
                      border: 'none',
                    }}
                    className="placeholder:text-[var(--text-faint)]"
                  />
                )}
              </div>
              {tags.length > 0 && (
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    color: 'var(--text-faint)',
                    marginTop: '0.5rem',
                  }}
                >
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
