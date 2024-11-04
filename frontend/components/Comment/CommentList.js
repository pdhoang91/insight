// // src/components/Comment/CommentList.js
// import React from 'react';
// import CommentItem from './CommentItem';
// import { FaSpinner } from 'react-icons/fa';

// const CommentList = ({ comments, postId, mutate }) => {
//   if (!Array.isArray(comments)) {
//     console.error('Comments data is not an array:', comments);
//     return <div className="text-red-500">Dữ liệu bình luận không hợp lệ.</div>;
//   }

//   if (comments.length === 0) {
//     return <p className="text-gray-600">Chưa có bình luận nào. Hãy là người đầu tiên!</p>;
//   }

//   return (
//     <ul className="space-y-4">
//       {comments.map((comment) => (
//         <CommentItem key={comment.id} comment={comment} postId={postId} mutate={mutate} />
//       ))}
//     </ul>
//   );
// };

// export default CommentList;

// src/components/Comment/CommentList.js
import React from 'react';
import CommentItem from './CommentItem';
import { FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CommentList = ({ comments, postId, mutate }) => {
  if (!Array.isArray(comments)) {
    console.error('Comments data is not an array:', comments);
    return <div className="text-red-500">Dữ liệu bình luận không hợp lệ.</div>;
  }

  if (comments.length === 0) {
    return <p className="text-gray-600">Chưa có bình luận nào. Hãy là người đầu tiên!</p>;
  }

  return (
    <ul className="space-y-4">
      <AnimatePresence>
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} mutate={mutate} />
        ))}
      </AnimatePresence>
    </ul>
  );
};

export default CommentList;

