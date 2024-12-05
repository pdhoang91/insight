// components/Editor/ToolbarButton.js
import React, { useState, useRef, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Tooltip styling

const ToolbarButton = ({ icon: Icon, onClick, isActive, tooltip, disabled, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (children) {
    // Đây là nút có dropdown menu (ví dụ: FaHeading)
    return (
      <div className="relative" ref={ref}>
        <Tippy content={tooltip} placement="top">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`p-2 rounded hover:bg-blue-100 focus:outline-none ${
              isActive ? 'bg-blue-500 text-white' : 'text-gray-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={tooltip}
            title={tooltip}
          >
            <Icon />
          </button>
        </Tippy>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-20">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Đây là nút đơn (ví dụ: FaBold, FaItalic, FaListUl, FaListOl)
  return (
    <Tippy content={tooltip} placement="top">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded hover:bg-blue-100 focus:outline-none ${
          isActive ? 'bg-blue-500 text-white' : 'text-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={tooltip}
        title={tooltip}
      >
        <Icon />
      </button>
    </Tippy>
  );
};

export default ToolbarButton;
