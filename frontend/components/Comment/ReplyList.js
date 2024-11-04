// src/components/Comment/ReplyList.js
import React from 'react';
import ReplyItem from './ReplyItem';

const ReplyList = ({ replies, commentId, mutate }) => {
  if (!Array.isArray(replies)) {
    console.error('Replies data is not an array:', replies);
    return <div className="text-red-500">Dữ liệu trả lời không hợp lệ.</div>;
  }

  if (replies.length === 0) {
    return <p className="text-gray-600">Chưa có trả lời nào. Hãy là người đầu tiên!</p>;
  }

  return (
    <ul className="space-y-4 mt-4 ml-8">
      {replies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} commentId={commentId} mutate={mutate} />
      ))}
    </ul>
  );
};

export default ReplyList;
