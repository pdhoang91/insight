// // components/Comment/CommentActions.js
// import React from 'react';
// import { FaHandsClapping, FaRegComments } from 'react-icons/fa';
// import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa'; // Icons for clap

// const CommentActions = ({ handleClap, clapsCount, hasClapped, handleToggleReply, repliesCount }) => {
//   return (
//     <div className="flex items-center space-x-6 mt-2">
//       {/* Clap Button */}
//       <button
//         onClick={handleClap}
//         className={`flex items-center text-sm font-medium ${
//           hasClapped ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
//         } transition-colors`}
//         aria-label="Clap for this comment"
//       >
//         {hasClapped ? <FaThumbsUp className="mr-1" /> : <FaRegThumbsUp className="mr-1" />}
//         {clapsCount}
//       </button>

//       {/* Reply Button */}
//       <button
//         onClick={handleToggleReply}
//         className="flex items-center text-sm text-gray-600 hover:text-blue-500 transition-colors"
//         aria-label="Reply to this comment"
//       >
//         <FaRegComments className="mr-1" /> Reply ({repliesCount})
//       </button>
//     </div>
//   );
// };

// export default CommentActions;

// src/components/Comment/CommentActions.js
// import React from 'react';
// import { FaThumbsUp, FaRegThumbsUp, FaReply } from 'react-icons/fa';

// const CommentActions = ({ handleClap, clapsCount, hasClapped, handleToggleReply, repliesCount }) => {
//   return (
//     <div className="flex items-center space-x-6 mt-2">
//       {/* Clap Button */}
//       <button
//         onClick={handleClap}
//         className={`flex items-center text-sm font-medium focus:outline-none transition-colors ${
//           hasClapped ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
//         }`}
//         aria-label="Clap for this comment"
//       >
//         {hasClapped ? <FaThumbsUp className="mr-1" /> : <FaRegThumbsUp className="mr-1" />}
//         {clapsCount}
//       </button>

//       {/* Reply Button */}
//       <button
//         onClick={handleToggleReply}
//         className="flex items-center text-sm text-gray-600 hover:text-blue-500 focus:outline-none transition-colors"
//         aria-label="Reply to this comment"
//       >
//         <FaReply className="mr-1" /> Reply ({repliesCount})
//       </button>
//     </div>
//   );
// };

// export default CommentActions;


// src/components/Comment/CommentActions.js
// src/components/Comment/CommentActions.js
import React from 'react';
import { FaThumbsUp, FaRegThumbsUp, FaReply, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
        {hasClapped ? <FaThumbsUp className="mr-1" /> : <FaRegThumbsUp className="mr-1" />}
        {clapsCount}
      </button>

      {/* Reply Button */}
      <button
        onClick={handleToggleReply}
        className="flex items-center text-sm text-gray-600 hover:text-blue-500 focus:outline-none transition-colors"
        aria-label="Reply to this comment"
      >
        <FaReply className="mr-1" /> Trả lời
      </button>

      {/* Toggle Replies Button */}
      {repliesCount > 0 && (
        <button
          onClick={handleToggleReplies}
          className="flex items-center text-sm text-gray-600 hover:text-blue-500 focus:outline-none transition-colors"
          aria-label={showReplies ? 'Ẩn phản hồi' : 'Hiển thị phản hồi'}
        >
          {showReplies ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
          {showReplies ? 'Ẩn phản hồi' : `Hiển thị phản hồi (${repliesCount})`}
        </button>
      )}
    </div>
  );
};

export default CommentActions;



