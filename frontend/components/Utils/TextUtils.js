// components/TextUtils.js
import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

const TextUtils = ({ html, maxLength = 200 }) => {
  // Sử dụng DOMPurify để làm sạch HTML
  const cleanHtml = DOMPurify.sanitize(html);

  // Hàm để loại bỏ thẻ HTML và lấy đoạn văn bản thuần túy
  const stripHtml = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Hàm để lấy đoạn văn bản ngắn từ nội dung
  const getSnippet = (content) => {
    const text = stripHtml(content);
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <span>{getSnippet(cleanHtml)}</span>
  );
};

export default TextUtils;
