// src/components/Comment/ReplyItem.js
import React from 'react';
import { FaHeart, FaUser } from "react-icons/fa";
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapReply } from '../../services/activityService';
import { useUser } from '../../context/UserContext';
import TimeAgo from '../Utils/TimeAgo';

const ReplyItem = ({ reply, commentId, mutate }) => {
  const { user } = useUser();
  const { clapsCount, loading: clapsLoading, hasClapped, mutate: mutateClaps } = useClapsCount('reply', reply.id);

  const handleClap = async () => {
    if (!user) {
      alert('Please login to clap.');
      return;
    }
    try {
      await clapReply(reply.id);
      mutateClaps(); // Refetch clap count
    } catch (error) {
      console.error('Failed to clap:', error);
      alert(error.message || 'Failed to clap. Please try again.');
    }
  };

  // Helper function to display clap count with loading state
  const clapsCountDisplay = (count, loading) => {
    if (loading) {
      return '...';
    }
    return count;
  };

  return (
    <div className="bg-medium-bg-secondary rounded-lg p-3 hover:bg-medium-hover transition-colors duration-300 shadow-sm">
      {/* Author Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-medium-bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          {reply.user?.avatar_url ? (
            <img
              src={reply.user.avatar_url}
              alt={reply.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaUser className="w-3 h-3 text-medium-accent-green" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-medium-text-primary text-body-small">
            {reply.user?.name || 'Anonymous'}
          </span>
          <span className="text-medium-text-muted text-small">
            <TimeAgo timestamp={reply.created_at} />
          </span>
        </div>
      </div>

      {/* Reply Content */}
      <div className="pl-8 mb-2">
        <div className="text-medium-text-secondary text-body-small leading-relaxed">
          {reply.content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center pl-8">
        <button
          onClick={handleClap}
          className={`flex items-center gap-1 text-body-small transition-colors ${
            hasClapped ? 'text-medium-accent-green' : 'text-medium-text-muted hover:text-medium-accent-green'
          }`}
          disabled={clapsLoading}
          aria-label="Clap for this reply"
        >
          <FaHeart className={`w-3 h-3 ${clapsLoading ? 'animate-pulse' : ''}`} />
          <span>{clapsCountDisplay(clapsCount, clapsLoading)}</span>
        </button>
      </div>
    </div>
  );
};

export default ReplyItem;
