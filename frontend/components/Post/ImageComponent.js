// components/Post/ImageComponent.js
import React from 'react';

const ImageComponent = ({ node, getPos, editor }) => {
  const { src, alt, title } = node.attrs;

  return (
    <img
      src={src}
      alt={alt}
      title={title}
      style={{ maxWidth: '100%', height: 'auto' }}
      // Bạn có thể thêm các tính năng chỉnh sửa ở đây
    />
  );
};

export default ImageComponent;
