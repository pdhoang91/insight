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
    <div className="bg-medium-bg-card rounded-lg p-md hover:bg-medium-hover transition-all duration-200 shadow-sm">
      {/* Author Info */}
      <div className="flex items-center gap-sm mb-sm">
        <div className="w-6 h-6 bg-medium-bg-secondary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
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
        <div className="flex items-center gap-sm">
          <span className="font-serif font-bold text-medium-text-primary text-body-small">
            {reply.user?.name || 'Anonymous'}
          </span>
          <span className="text-medium-text-muted text-body-small">
            <TimeAgo timestamp={reply.created_at} />
          </span>
        </div>
      </div>

      {/* Reply Content */}
      <div className="pl-8 mb-sm">
        <div className="text-medium-text-secondary text-body leading-relaxed">
          {reply.content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center pl-8">
        <button
          onClick={handleClap}
          className={`flex items-center gap-sm text-body-small transition-all duration-200 ${
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
