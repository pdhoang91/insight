
// components/Comment/CommentContainer.js
import React from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import { useComments } from '../../hooks/useComments';
import { useUser } from '../../context/UserContext';

const CommentContainer = ({ postId }) => {
  const { user } = useUser();
  const { comments, isLoading, isError, mutate } = useComments(postId, true, 1, 10);

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
      mutate(); // Tải lại dữ liệu sau khi thêm comment
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Gửi bình luận thất bại. Vui lòng thử lại.');
    }
  };

  if (isError) return <div className="text-red-500">Failed to load comments.</div>;
  if (isLoading) return <div>Loading comments...</div>;

  return (
    <div>
      {user ? (
        <AddCommentForm onAddComment={handleAddComment} />
      ) : (
        <p className="text-gray-600">Bạn cần đăng nhập để bình luận.</p>
      )}
      <CommentList comments={comments} postId={postId} mutate={mutate} />
    </div>
  );
};

export default CommentContainer;
