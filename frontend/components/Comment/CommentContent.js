// components/Comment/CommentContent.js
import React from 'react';
import Mention from './Mention';

const CommentContent = ({ content }) => {
  // Function to highlight mentions
  const renderContent = (content) => {
    const regex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      parts.push(content.substring(lastIndex, match.index));
      parts.push(
        <Mention
          key={match.index}
          username={match[1]}
          className="text-primary hover:underline cursor-pointer"
        />
      );
      lastIndex = regex.lastIndex;
    }

    parts.push(content.substring(lastIndex));
    return parts;
  };

  return <p className="text-sm text-primary font-primary">{renderContent(content)}</p>;
};

export default CommentContent;
