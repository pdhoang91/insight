// components/Comment/CommentSection.js
import React, { useMemo } from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import { addComment } from '../../services/commentService';
import { useComments } from '../../hooks/useComments';
import { FaSpinner } from 'react-icons/fa';

const CommentSection = ({ postId, user }) => {
  const { comments, isLoading, isError, mutate } = useComments(postId, true, 1, 10);

  const countComments = (commentsArray) => {
    let count = 0;
    for (const comment of commentsArray) {
      count += 1;
      if (comment.children && comment.children.length > 0) {
        count += countComments(comment.children);
      }
    }
    return count;
  };

  const totalComments = useMemo(() => {
    if (comments && comments.length > 0) {
      return countComments(comments);
    }
    return 0;
  }, [comments]);

  const handleAddComment = async (content) => {
    if (!user) {
      alert('Bạn cần đăng nhập để bình luận.');
      return;
    }
    if (!content.trim()) {
      alert('Nội dung bình luận không được để trống.');
      return;
    }
    try {
      await addComment(postId, content, user.id);
      mutate();
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Gửi bình luận thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="mt-12 border-t border-primary pt-8 bg-surface">
      {/* Header */}
      <div className="mb-6 px-8">
        <h2 className="text-2xl font-bold text-primary font-mono mb-2">
          Comments ({totalComments})
        </h2>
      </div>

      {/* Add Comment Form */}
      <div className="mb-8 px-8">
        {user ? (
          <AddCommentForm onAddComment={handleAddComment} />
        ) : (
          <div className="p-4 border border-primary rounded-md bg-elevated">
            <p className="text-muted font-mono">// Login required to comment</p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="px-8">
        {isError && (
          <div className="text-red-400 font-mono mb-4">// Failed to load comments</div>
        )}
        {isLoading && !isError && (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-primary mr-2" />
            <span className="text-secondary font-mono">Loading comments...</span>
          </div>
        )}
        {comments && <CommentList comments={comments} postId={postId} mutate={mutate} />}
      </div>
    </div>
  );
};

export default CommentSection; 