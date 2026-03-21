// components/Editor/TitleInput.js
import React, { useRef } from 'react';

const TitleInput = ({ title, setTitle, placeholder = 'Title' }) => {
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
        placeholder={placeholder}
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
    </div>
  );
};

export default TitleInput;
