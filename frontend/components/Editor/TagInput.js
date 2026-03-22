'use client';
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';

const spring = { type: 'spring', stiffness: 100, damping: 20 };

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: 'var(--font-display)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  }}>
    {children}
  </p>
);

/**
 * @param {{ tags: string[], onChange: (tags: string[]) => void }} props
 */
const TagInput = ({ tags, onChange }) => {
  const [tagInput, setTagInput] = React.useState('');
  const tagInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 5) {
        onChange([...tags, newTag]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => onChange(tags.filter((_, i) => i !== index));

  return (
    <div>
      <SectionLabel>Tags</SectionLabel>
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
            onKeyDown={handleKeyDown}
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
  );
};

export default TagInput;
