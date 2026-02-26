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

  // #region agent log
  fetch('http://127.0.0.1:7476/ingest/15469c75-35dc-48d4-bf40-8d2565f7ce6f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6f33ee'},body:JSON.stringify({sessionId:'6f33ee',location:'TitleInput.js:render',message:'TitleInput rendered',data:{title,hasImageTitle:!!imageTitle},timestamp:Date.now(),runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion

  // #region agent log
  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      const styles = window.getComputedStyle(el);
      fetch('http://127.0.0.1:7476/ingest/15469c75-35dc-48d4-bf40-8d2565f7ce6f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6f33ee'},body:JSON.stringify({sessionId:'6f33ee',location:'TitleInput.js:dom-measure',message:'Textarea DOM measurements',data:{offsetHeight:el.offsetHeight,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,computedHeight:styles.height,computedMinHeight:styles.minHeight,computedFontSize:styles.fontSize,computedLineHeight:styles.lineHeight,computedPadding:styles.padding,computedOverflow:styles.overflow,rows:el.rows,value:el.value,placeholder:el.placeholder,parentOffsetTop:el.parentElement?.offsetTop,parentOffsetHeight:el.parentElement?.offsetHeight},timestamp:Date.now(),runId:'run2',hypothesisId:'H6'})}).catch(()=>{});
    }
  }, [title]);
  // #endregion

  return (
    <div className="group/title mb-8">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        placeholder="Title"
        className="title-textarea w-full bg-transparent border-none outline-none resize-none font-serif text-[42px] font-bold text-[#292929] leading-[1.25] tracking-[-0.011em] py-0 min-h-[52px]"
        rows={1}
        autoFocus
      />

      {imageTitle ? (
        <div className="relative mt-6">
          <img
            src={imageTitle}
            alt="Cover"
            className="w-full max-h-[400px] object-cover rounded"
          />
          <button
            onClick={() => setImageTitle(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleImageTitleUpload}
          disabled={isUploadingTitle}
          className="title-cover-btn mt-2 flex items-center gap-2 text-sm text-[#b3b3b1] hover:text-[#757575] transition-all duration-200"
        >
          {isUploadingTitle ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <FaImage className="w-3.5 h-3.5" />
              <span>Add a cover image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TitleInput;
