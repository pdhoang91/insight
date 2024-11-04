// // src/components/Comment/CommentItem.js
// import React, { useState } from 'react';
// import AddCommentForm from './AddCommentForm';
// import CommentContent from './CommentContent';
// import CommentActions from './CommentActions';
// import AuthorInfo from '../Auth/AuthorInfo';
// import ReplyList from './ReplyList';
// import { useClapsCount } from '../../hooks/useClapsCount';
// import { useUser } from '../../context/UserContext';
// import { addReply } from '../../services/commentService';
// import { clapComment } from '../../services/activityService';
// import TimeAgo from '../Utils/TimeAgo';

// const CommentItem = ({ comment, postId, mutate }) => {
//   const [showReplyForm, setShowReplyForm] = useState(false);
//   const { clapsCount, loading: clapsLoading, hasClapped, mutate: mutateClaps } = useClapsCount('comment', comment.id);
//   const { user } = useUser();
//   const repliesCount = comment.children ? comment.children.length : 0;

//   const handleClap = async () => {
//     if (!user) {
//       alert('Bạn cần đăng nhập để clap.');
//       return;
//     }
//     try {
//       await clapComment(comment.id);
//       mutateClaps(); // Refetch clap count
//     } catch (error) {
//       console.error('Failed to clap:', error);
//       alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
//     }
//   };

//   const handleToggleReply = () => {
//     setShowReplyForm((prev) => !prev);
//   };

//   const handleReply = async (content, commentID) => {
//     if (!user) {
//       alert('Bạn cần đăng nhập để trả lời.');
//       return;
//     }
//     if (!content.trim()) {
//       alert('Nội dung trả lời không được để trống.');
//       return;
//     }

//     try {
//       await addReply(commentID, content, user.id);
//       mutate(); // Refetch comments
//       setShowReplyForm(false);
//     } catch (err) {
//       console.error('Failed to add reply:', err);
//       alert('Gửi trả lời thất bại. Vui lòng thử lại.');
//     }
//   };

//   return (
//     <li className="p-4 rounded bg-gray-50 shadow-sm">
//       {/* Author Info */}
//       <AuthorInfo author={comment.user} />

//       {/* Comment Content */}
//       <CommentContent content={comment.content} />

//       {/* Timestamp */}
//       {/* <p className="text-gray-500 text-xs mt-1">{new Date(comment.created_at).toLocaleString()}</p> */}
//          {/* Timestamp */}
//          <TimeAgo timestamp={comment.created_at} />

//       {/* Actions */}
//       <CommentActions
//         handleClap={handleClap}
//         clapsCount={clapsCount}
//         hasClapped={hasClapped}
//         handleToggleReply={handleToggleReply}
//         repliesCount={repliesCount}
//         showReplyForm={showReplyForm}
//       />

//       {/* Reply Form */}
//       {showReplyForm && (
//         <div className="mt-4 ml-8">
//           <AddCommentForm onAddComment={(content) => handleReply(content, comment.id)} parentId={comment.id} />
//         </div>
//       )}

//       {/* Replies List */}
//       {comment.replies && comment.replies.length > 0 && (
//         <ReplyList replies={comment.replies} commentId={comment.id} mutate={mutate} />
//       )}
//     </li>
//   );
// };

// export default CommentItem;

// src/components/Comment/CommentItem.js
import React, { useState } from 'react';
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import CommentActions from './CommentActions';
import AuthorInfo from '../Auth/AuthorInfo';
import ReplyList from './ReplyList';
import { useClapsCount } from '../../hooks/useClapsCount';
import { useUser } from '../../context/UserContext';
import { addReply } from '../../services/commentService';
import { clapComment } from '../../services/activityService';
import TimeAgo from '../Utils/TimeAgo';
import { motion, AnimatePresence } from 'framer-motion';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { clapsCount, loading: clapsLoading, hasClapped, mutate: mutateClaps } = useClapsCount('comment', comment.id);
  const { user } = useUser();
  const repliesCount = comment.children ? comment.children.length : 0;

  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }
    try {
      await clapComment(comment.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };

  const handleToggleReply = () => {
    setShowReplyForm((prev) => !prev);
  };

  const handleReply = async (content, commentID) => {
    if (!user) {
      alert('Bạn cần đăng nhập để trả lời.');
      return;
    }
    if (!content.trim()) {
      alert('Nội dung trả lời không được để trống.');
      return;
    }

    try {
      await addReply(commentID, content, user.id);
      mutate();
      setShowReplyForm(false);
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert('Gửi trả lời thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <motion.li
      className="p-4 rounded bg-gray-50 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Author Info */}
      <AuthorInfo author={comment.user} />

      {/* Comment Content */}
      <CommentContent content={comment.content} />

      {/* Timestamp */}
      <TimeAgo timestamp={comment.created_at} />

      {/* Actions */}
      <CommentActions
        handleClap={handleClap}
        clapsCount={clapsCount}
        hasClapped={hasClapped}
        handleToggleReply={handleToggleReply}
        repliesCount={repliesCount}
        showReplyForm={showReplyForm}
      />

      {/* Reply Form with Animation */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            className="mt-4 ml-8"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AddCommentForm onAddComment={(content) => handleReply(content, comment.id)} parentId={comment.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies List */}
      {comment.replies && comment.replies.length > 0 && (
        <ReplyList replies={comment.replies} commentId={comment.id} mutate={mutate} />
      )}
    </motion.li>
  );
};

export default CommentItem;



