// components/Comment/CommentSection.js
import React, { useMemo } from 'react';
import LimitedCommentList from './LimitedCommentList';
import AddCommentForm from './AddCommentForm';
import { addComment } from '../../services/commentService';
import { useInfiniteComments } from '../../hooks/useInfiniteComments';
import { FaSpinner } from 'react-icons/fa';

const CommentSection = ({ postId, user }) => {
  const { 
    comments, 
    totalCount, 
    totalCommentReply,
    isLoading, 
    isError, 
    canLoadMore,
    loadMore,
    mutate 
  } = useInfiniteComments(postId, true, 2);

  const totalComments = totalCount;

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Bạn cần đăng nhập để bình luận.');
      return;
    }
    if (!content.trim()) {
      alert('Nội dung bình luận không thể để trống.');
      return;
    }
    try {
      await addComment(postId, content); // Only pass postId and content
      mutate(); // Refresh comments
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Không thể thêm bình luận. Vui lòng thử lại.');
    }
  };

  return (
    <div className="mt-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary font-mono mb-2">
          Bình luận ({totalComments})
        </h2>
      </div>

      {/* Add Comment Form */}
      <div>
        {user ? (
          <AddCommentForm onAddComment={handleAddComment} />
        ) : (
          <div className="p-4 border border-primary rounded-md bg-elevated">
            <p className="text-muted font-mono">// Cần đăng nhập để bình luận</p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="">
        {isError && (
          <div className="text-red-400 font-mono mb-4">// Không thể tải bình luận</div>
        )}
        {isLoading && !isError && (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-primary mr-2" />
            <span className="text-secondary font-mono">Đang tải bình luận...</span>
          </div>
        )}
        {comments && (
          <LimitedCommentList 
            comments={comments} 
            postId={postId} 
            mutate={mutate}
            canLoadMore={canLoadMore}
            loadMore={loadMore}
            isLoadingMore={isLoading}
            totalCount={totalCount}
          />
        )}
      </div>
    </div>
  );
};

export default CommentSection; 