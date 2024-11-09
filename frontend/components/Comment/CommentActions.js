// // components/Comment/CommentActions.js
// src/components/Comment/CommentActions.js
import React from 'react';
import { FaThumbsUp, FaRegThumbsUp, FaReply, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaEye, FaShareAlt, FaRegBookmark, FaBookmark, FaComment } from 'react-icons/fa';
import { FaHandsClapping } from "react-icons/fa6";

const CommentActions = ({
  handleClap,
  clapsCount,
  hasClapped,
  handleToggleReply,
  repliesCount,
  showReplyForm,
  handleToggleReplies,
  showReplies,
}) => {
  return (
    <div className="flex items-center space-x-6 mt-2">
      {/* Clap Button */}
      <button
        onClick={handleClap}
        className={`flex items-center text-sm font-medium focus:outline-none transition-colors ${
          hasClapped ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
        }`}
        aria-label="Clap for this comment"
      >
        {hasClapped ? <FaHandsClapping className="mr-1" /> : <FaHandsClapping className="mr-1" />}
        {clapsCount}
      </button>

      {/* Reply Button */}
      <button
        onClick={handleToggleReply}
        className="flex items-center text-sm text-gray-600 hover:text-blue-500 focus:outline-none transition-colors"
        aria-label="Reply to this comment"
      >
        <FaComment className="mr-1" /> {repliesCount}
      </button>
    </div>
  );
};

export default CommentActions;



