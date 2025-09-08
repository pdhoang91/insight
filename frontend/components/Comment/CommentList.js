// components/Comment/CommentList.js
import React from 'react';
import CommentItem from './CommentItem';

const CommentList = ({ comments, postId, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-medium-bg-secondary rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-medium-bg-secondary rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6 text-medium-text-secondary">
        <p>Không thể tải bình luận. Vui lòng thử lại.</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-medium-text-secondary">
        <p className="text-body">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
        />
      ))}
    </div>
  );
};

export default CommentList;
