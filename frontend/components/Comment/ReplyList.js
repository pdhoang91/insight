'use client';
import React from 'react';
import ReplyItem from './ReplyItem';

const ReplyList = ({ replies, commentId, mutate }) => {
  if (!Array.isArray(replies) || replies.length === 0) return null;

  return (
    <div>
      {[...replies].reverse().map((reply) => (
        <ReplyItem key={reply.id} reply={reply} commentId={commentId} mutate={mutate} />
      ))}
    </div>
  );
};

export default ReplyList;
