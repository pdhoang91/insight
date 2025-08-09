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
    console.error('Comments data is not an array:', comments);
    return <div className="text-red-500">Dữ liệu bình luận không hợp lệ.</div>;
  }

  if (comments.length === 0) {
    return <p className="text-muted font-mono text-center py-8">// No comments yet</p>;
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <ul className="space-y-4">
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
            className="flex items-center gap-2 px-6 py-3 bg-elevated border border-border-primary rounded-lg text-secondary hover:text-primary hover:bg-surface transition-all duration-200 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <FaChevronDown className="w-4 h-4" />
                <span>Load more comments ({totalCount - comments.length} remaining)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Comments Count Info */}
      {totalCount > 0 && (
        <div className="text-center text-muted text-sm font-mono pt-2">
          Showing {comments.length} of {totalCount} comments
        </div>
      )}
    </div>
  );
};

export default LimitedCommentList; 