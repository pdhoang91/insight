'use client';
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Image, ArrowCircleUp, X } from '@phosphor-icons/react';
import { uploadImage } from '../../services/imageService';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Spinner } from '../UI/Loading';

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml';
const spring = { type: 'spring', stiffness: 100, damping: 20 };

const CoverImageUploader = ({ imageTitle, setImageTitle }) => {
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => { setImgError(false); }, [imageTitle]);

  const uploadFn = useCallback((file) => uploadImage(file, 'title'), []);
  const { upload, isUploading, error: uploadError } = useFileUpload({ accept: ACCEPT, uploadFn });

  const handleUpload = () => upload((url) => setImageTitle(url));

  if (imageTitle) {
    return (
      <>
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <img
            src={imageTitle}
            alt="Cover"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: imgError ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
            className={imgError ? undefined : 'group hover:bg-[rgba(0,0,0,0.35)]'}
          >
            <button
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                opacity: imgError ? 1 : 0,
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
              className={imgError ? undefined : 'group-hover:opacity-100'}
            >
              <ArrowCircleUp size={15} weight="regular" />
              Change
            </button>
            <button
              onClick={() => setImageTitle(null)}
              style={{
                opacity: imgError ? 1 : 0,
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
              className={imgError ? undefined : 'group-hover:opacity-100'}
            >
              <X size={14} weight="regular" />
              Remove
            </button>
          </div>
        </div>
        {uploadError && (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            color: 'var(--color-error, #c0392b)',
            marginTop: '-0.75rem',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            {uploadError}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <motion.button
        onClick={handleUpload}
        disabled={isUploading}
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
          cursor: isUploading ? 'not-allowed' : 'pointer',
          padding: 0,
        }}
        className="hover:bg-[var(--bg-elevated)]"
      >
        {isUploading ? (
          <Spinner size="sm" />
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
      {uploadError && (
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          color: 'var(--color-error, #c0392b)',
          marginTop: '-0.75rem',
          marginBottom: '1rem',
          letterSpacing: '-0.01em',
        }}>
          {uploadError}
        </p>
      )}
    </>
  );
};

export default CoverImageUploader;
