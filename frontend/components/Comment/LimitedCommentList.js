// components/Comment/LimitedCommentList.js
import React from 'react';
import CommentItem from './CommentItem';
import { AnimatePresence } from 'framer-motion';
import { FaSpinner, FaChevronDown } from 'react-icons/fa';

const LimitedCommentList = ({ 
  comments, 
  postId, 
  mutate, 
  canLoadMore, 
  loadMore, 
  isLoadingMore,
  totalCount,
  showingCount 
}) => {
  if (!Array.isArray(comments)) {

    return <div className="text-medium-error">Dữ liệu bình luận không hợp lệ.</div>;
  }

  if (comments.length === 0) {
    return <p className="text-medium-text-muted text-center py-8 text-body">Chưa có bình luận nào</p>;
  }

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <ul className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} mutate={mutate} />
          ))}
        </AnimatePresence>
      </ul>

      {/* Load More Button */}
      {canLoadMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-3 bg-medium-bg-card rounded-button text-medium-text-secondary hover:text-medium-text-primary hover:bg-medium-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isLoadingMore ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <FaChevronDown className="w-4 h-4" />
                <span>Xem thêm bình luận ({Math.max(0, totalCount - comments.length)} còn lại)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Comments Count Info */}
      {totalCount > 0 && (
        <div className="text-center text-medium-text-muted text-body-small pt-2">
          Hiển thị {comments.length} trong số {totalCount} bình luận
        </div>
      )}
    </div>
  );
};

export default LimitedCommentList; 