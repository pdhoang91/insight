// src/components/Comment/ReplyList.js
import React from 'react';
import ReplyItem from './ReplyItem';

const ReplyList = ({ replies, commentId, mutate }) => {
  if (!Array.isArray(replies)) {

    return (
      <div className="text-hacker-red text-sm font-mono">
        <span className="text-hacker-red">ERROR:</span> Invalid replies data format
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...replies].reverse().map((reply) => (
        <ReplyItem key={reply.id} reply={reply} commentId={commentId} mutate={mutate} />
      ))}
    </div>
  );
};

export default ReplyList;