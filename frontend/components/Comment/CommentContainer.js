
// components/Comment/CommentContainer.js
import React from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import { useComments } from '../../hooks/useComments';
import { useUser } from '../../context/UserContext';
import { addComment } from '../../services/commentService';

const CommentContainer = ({ postId }) => {
  const { user } = useUser();
  const { comments, isLoading, isError, mutate } = useComments(postId, true, 1, 10);

  const handleAddComment = async (content) => {
    if (!user) {
      alert('You need to login to comment.');
      return;
    }
    if (!content.trim()) {
      alert('Comment content cannot be empty.');
      return;
    }
    try {
      await addComment(postId, content); // Only pass postId and content
      mutate(); // Refresh comments after adding
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  if (isError) return <div className="text-red-500">Failed to load comments.</div>;
  if (isLoading) return <div>Loading comments...</div>;

  return (
    <div>
      {user ? (
        <AddCommentForm onAddComment={handleAddComment} />
      ) : (
        <p className="text-gray-600">You need to login to comment.</p>
      )}
      <CommentList comments={comments} postId={postId} mutate={mutate} />
    </div>
  );
};

export default CommentContainer;
