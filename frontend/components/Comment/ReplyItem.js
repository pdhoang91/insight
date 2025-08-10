// src/components/Comment/ReplyItem.js
import React from 'react';
import { FaHandsClapping, FaUser } from "react-icons/fa6";
import Mention from './Mention';
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

  // Function to highlight mentions with terminal styling
  const renderContent = (content) => {
    const regex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      parts.push(content.substring(lastIndex, match.index));
      parts.push(<Mention key={match.index} username={match[1]} />);
      lastIndex = regex.lastIndex;
    }

    parts.push(content.substring(lastIndex));
    return parts;
  };

  // Helper function to display clap count with loading state
  const clapsCountDisplay = (count, loading) => {
    if (loading) {
      return '...';
    }
    return count;
  };

  return (
    <div className="bg-terminal-light border border-matrix-green/20 rounded-lg p-3 hover:border-matrix-green/40 transition-colors duration-300">
      {/* Author Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-terminal-gray rounded-full border border-matrix-green/50 flex items-center justify-center flex-shrink-0">
          {reply.user?.avatar ? (
            <img
              src={reply.user.avatar}
              alt={reply.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FaUser className="w-3 h-3 text-matrix-green" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary text-sm">
            {reply.user?.name || 'Anonymous'}
          </span>
          <span className="text-text-muted text-xs">
            <TimeAgo timestamp={reply.created_at} />
          </span>
        </div>
      </div>

      {/* Reply Content */}
      <div className="pl-8 mb-2">
        <div className="text-text-secondary text-sm leading-relaxed">
          {renderContent(reply.content)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center pl-8">
        <button
          onClick={handleClap}
          className={`flex items-center gap-1 text-sm transition-colors ${
            hasClapped ? 'text-hacker-yellow' : 'text-text-muted hover:text-hacker-yellow'
          }`}
          disabled={clapsLoading}
          aria-label="Clap for this reply"
        >
          <FaHandsClapping className={`w-3 h-3 ${clapsLoading ? 'animate-pulse' : ''}`} />
          <span>{clapsCountDisplay(clapsCount, clapsLoading)}</span>
        </button>
      </div>
    </div>
  );
};

export default ReplyItem;
