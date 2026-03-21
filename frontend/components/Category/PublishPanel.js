'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, ArrowCircleUp, Plus, Check } from '@phosphor-icons/react';
import { useCategories } from '../../hooks/useCategories';
import { getContentPlainText } from '../../utils/renderContent';
import { uploadImage } from '../../services/imageService';
import { createCategory } from '../../services/categoryService';
import { useUser } from '../../context/UserContext';
import { isAdmin } from '../../constants/roles';
import LoadingSpinner from '../Shared/LoadingSpinner';

const spring = { type: 'spring', stiffness: 100, damping: 20 };

const SkeletonChip = ({ width = '5rem' }) => (
  <div
    style={{
      height: '2rem',
      width,
      borderRadius: '3px',
      background: 'var(--bg-elevated)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface) 50%, transparent 100%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer-warm 1.5s ease-in-out infinite',
      }}
    />
  </div>
);

const PublishPanel = ({
  title,
  content,
  imageTitle,
  setImageTitle,
  initialCategories = [],
  initialTags = [],
  onPublish,
  onCancel,
}) => {
  const { user } = useUser();
  const { categories, isLoading } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [tags, setTags] = useState(
    initialTags.map(t => (typeof t === 'string' ? t : t.name))
  );
  const [tagInput, setTagInput] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const tagInputRef = React.useRef(null);

  const userIsAdmin = isAdmin(user?.role);

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

  const handleCreateCategory = async () => {
    const name = newCategoryInput.trim();
    if (!name) return;
    setIsCreatingCategory(true);
    setCreateError('');
    try {
      const created = await createCategory(name);
      setNewCategoryInput('');
      setShowNewCategoryInput(false);
      // Auto-select newly created category if slots available
      if (selectedCategories.length < 3) {
        setSelectedCategories(prev => [...prev, created]);
      }
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create category');
    } finally {
      setIsCreatingCategory(false);
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

  const removeTag = (index) => setTags(tags.filter((_, i) => i !== index));

  const handlePublish = () => {
    onPublish(selectedCategories, tags);
  };

  const canPublish = selectedCategories.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--bg)',
        overflowY: 'auto',
      }}
    >
      {/* Top bar — glassmorphism */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(242, 237, 228, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)',
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
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={spring}
            style={{
              padding: '0.5rem',
              marginLeft: '-0.5rem',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            className="hover:text-[var(--text)]"
          >
            <X size={20} weight="regular" />
          </motion.button>

          <motion.button
            onClick={handlePublish}
            disabled={!canPublish}
            whileHover={canPublish ? { scale: 1.03 } : {}}
            whileTap={canPublish ? { scale: 0.97, y: 1 } : {}}
            transition={spring}
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
              letterSpacing: '-0.01em',
            }}
            className={canPublish ? 'hover:opacity-85' : ''}
          >
            Publish now
          </motion.button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1032px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">

          {/* Left — Story preview */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Story Preview
            </p>

            {/* Cover image */}
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
              <motion.button
                onClick={handleCoverUpload}
                disabled={isUploadingCover}
                whileHover={{ borderColor: 'var(--border-mid)' }}
                whileTap={{ scale: 0.99 }}
                transition={spring}
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
                  padding: 0,
                }}
                className="hover:bg-[var(--bg-elevated)]"
              >
                {isUploadingCover ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Image size={22} weight="thin" color="var(--text-faint)" />
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-faint)',
                      letterSpacing: '-0.01em',
                    }}>
                      Add a cover image
                    </span>
                  </>
                )}
              </motion.button>
            )}

            <h3 style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.375rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '0.5rem',
              lineHeight: 1.3,
            }}>
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
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                color: 'var(--text-faint)',
                marginTop: '0.5rem',
                lineHeight: 1.5,
              }}>
                Write a preview subtitle for the homepage and emails.
                <span style={{ float: 'right' }}>{displayExcerpt.length}/280</span>
              </p>
            </div>
          </motion.div>

          {/* Right — Categories + Tags */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            style={{ width: '320px', flexShrink: 0 }}
            className="lg:w-[320px] w-full"
          >
            {/* Categories section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}>
                  Categories
                </p>

                {/* Admin: add new category button */}
                {userIsAdmin && (
                  <motion.button
                    onClick={() => { setShowNewCategoryInput(v => !v); setCreateError(''); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={spring}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: showNewCategoryInput ? 'var(--accent)' : 'var(--text-muted)',
                      background: 'none',
                      border: '1px solid',
                      borderColor: showNewCategoryInput ? 'var(--accent)' : 'var(--border)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      letterSpacing: '-0.01em',
                      transition: 'all 0.2s',
                    }}
                    className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Plus size={11} weight="bold" />
                    New
                  </motion.button>
                )}
              </div>

              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                lineHeight: 1.5,
              }}>
                {userIsAdmin
                  ? 'Select or create categories (up to 3).'
                  : 'Add up to 3 categories so readers know what your story is about.'}
              </p>

              {/* Admin: inline new category input */}
              <AnimatePresence>
                {userIsAdmin && showNewCategoryInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={spring}
                    style={{ overflow: 'hidden', marginBottom: '0.75rem' }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                        placeholder="Category name..."
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.8125rem',
                          border: '1px solid var(--border-mid)',
                          borderRadius: '3px',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          outline: 'none',
                        }}
                        className="focus:border-[var(--accent)] placeholder:text-[var(--text-faint)]"
                      />
                      <motion.button
                        onClick={handleCreateCategory}
                        disabled={!newCategoryInput.trim() || isCreatingCategory}
                        whileTap={{ scale: 0.95, y: 1 }}
                        transition={spring}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: newCategoryInput.trim() ? 'var(--accent)' : 'var(--bg-surface)',
                          color: newCategoryInput.trim() ? 'var(--text-inverse)' : 'var(--text-faint)',
                          border: 'none',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: newCategoryInput.trim() ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isCreatingCategory ? <LoadingSpinner size="xs" /> : <Check size={13} weight="bold" />}
                        Add
                      </motion.button>
                    </div>
                    {createError && (
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.75rem',
                        color: '#DC2626',
                        marginTop: '0.375rem',
                      }}>
                        {createError}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category chips */}
              {isLoading ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[...Array(6)].map((_, i) => (
                    <SkeletonChip key={i} width={`${4 + (i % 3)}rem`} />
                  ))}
                </div>
              ) : (
                <motion.div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.04 } },
                    hidden: {},
                  }}
                >
                  {categories?.map((cat) => {
                    const isSelected = selectedCategories.some(c => c.id === cat.id);
                    const isDisabled = !isSelected && selectedCategories.length >= 3;
                    return (
                      <motion.button
                        key={cat.id}
                        layout
                        layoutId={`cat-${cat.id}`}
                        onClick={() => !isDisabled && toggleCategory(cat)}
                        disabled={isDisabled}
                        variants={{
                          hidden: { opacity: 0, scale: 0.85 },
                          visible: { opacity: 1, scale: 1 },
                        }}
                        whileHover={!isDisabled ? { scale: 1.04 } : {}}
                        whileTap={!isDisabled ? { scale: 0.96, y: 1 } : {}}
                        transition={spring}
                        style={{
                          padding: '0.375rem 0.75rem',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          borderRadius: '3px',
                          border: `1px solid ${isSelected ? 'var(--accent)' : isDisabled ? 'var(--border)' : 'var(--border-mid)'}`,
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          color: isSelected ? 'var(--text-inverse)' : isDisabled ? 'var(--text-faint)' : 'var(--text-muted)',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          letterSpacing: '-0.01em',
                        }}
                        className={!isSelected && !isDisabled ? 'hover:border-[var(--accent)] hover:text-[var(--accent)]' : ''}
                      >
                        {cat.name}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {selectedCategories.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={spring}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    color: 'var(--text-faint)',
                    marginTop: '0.75rem',
                  }}
                >
                  {selectedCategories.length}/3 selected
                </motion.p>
              )}
            </div>

            {/* Tags section */}
            <div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}>
                Tags
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                lineHeight: 1.5,
              }}>
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
                <AnimatePresence>
                  {tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={spring}
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
                    </motion.span>
                  ))}
                </AnimatePresence>

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
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  color: 'var(--text-faint)',
                  marginTop: '0.5rem',
                }}>
                  {tags.length}/5 tags
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublishPanel;
