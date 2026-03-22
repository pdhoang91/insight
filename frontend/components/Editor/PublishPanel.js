'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { getContentPlainText } from '../../utils/renderContent';
import CoverImageUploader from './CoverImageUploader';
import CategorySelector from './CategorySelector';
import TagInput from './TagInput';

const spring = { type: 'spring', stiffness: 100, damping: 20 };

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: 'var(--font-display)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  }}>
    {children}
  </p>
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
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [tags, setTags] = useState(
    initialTags.map(t => (typeof t === 'string' ? t : t.name))
  );
  const [excerpt, setExcerpt] = useState('');

  const autoExcerpt = useMemo(() => {
    const plain = getContentPlainText(content);
    return plain?.substring(0, 160) || '';
  }, [content]);

  const displayExcerpt = excerpt || autoExcerpt;
  const canPublish = selectedCategories.length > 0;

  const handlePublish = () => onPublish(selectedCategories, tags);

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
            <SectionLabel>Story Preview</SectionLabel>

            <CoverImageUploader imageTitle={imageTitle} setImageTitle={setImageTitle} />

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
            <CategorySelector selected={selectedCategories} onChange={setSelectedCategories} />
            <TagInput tags={tags} onChange={setTags} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublishPanel;
