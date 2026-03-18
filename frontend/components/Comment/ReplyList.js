'use client';
import React from 'react';
import { motion } from 'framer-motion';
import ReplyItem from './ReplyItem';

const replyListVariants = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const replyItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 120, damping: 22 },
  },
};

const ReplyList = ({ replies, commentId, mutate }) => {
  if (!Array.isArray(replies) || replies.length === 0) return null;

  return (
    <motion.div
      variants={replyListVariants}
      initial="hidden"
      animate="visible"
    >
      {[...replies].reverse().map((reply) => (
        <motion.div key={reply.id} variants={replyItemVariants}>
          <ReplyItem reply={reply} commentId={commentId} mutate={mutate} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ReplyList;
