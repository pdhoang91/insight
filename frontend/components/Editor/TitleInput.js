// components/Editor/TitleInput.js
import React, { useRef, useEffect } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../Shared/LoadingSpinner';

const TitleInput = ({
  title,
  setTitle,
  imageTitle,
  setImageTitle,
  handleImageTitleUpload,
  isUploadingTitle,
}) => {
  const textareaRef = useRef(null);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        placeholder="Title"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 2.625rem)',
          fontWeight: 800,
          color: 'var(--text)',
          lineHeight: 1.25,
          letterSpacing: '-0.025em',
          padding: 0,
          minHeight: '52px',
        }}
        rows={1}
        autoFocus
      />

      {imageTitle ? (
        <div style={{ position: 'relative', marginTop: '1.5rem' }}>
          <img
            src={imageTitle}
            alt="Cover"
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <button
            onClick={() => setImageTitle(null)}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              padding: '0.5rem',
              borderRadius: '50%',
              background: 'rgba(26, 20, 16, 0.6)',
              color: 'var(--text-inverse)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            className="hover:bg-[rgba(26,20,16,0.8)]"
          >
            <FaTimes style={{ width: 14, height: 14 }} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleImageTitleUpload}
          disabled={isUploadingTitle}
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-faint)',
            background: 'none',
            border: 'none',
            cursor: isUploadingTitle ? 'not-allowed' : 'pointer',
            padding: 0,
            transition: 'color 0.2s',
          }}
          className="hover:text-[var(--text-muted)]"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <FaImage style={{ width: 14, height: 14 }} />
              <span>Add a cover image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TitleInput;
