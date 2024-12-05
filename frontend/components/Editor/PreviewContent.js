// components/Editor/PreviewContent.js
import React from 'react';

const PreviewContent = ({ content }) => (
  <div className="prose lg:prose-xl max-w-none mb-8">
    <div
      className="post-content content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  </div>
);

export default PreviewContent;
