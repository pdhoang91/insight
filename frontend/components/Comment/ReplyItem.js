// src/components/Comment/ReplyItem.js
import React from 'react';
import { FaHandsClapping, FaUser, FaReply } from "react-icons/fa6";
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
      alert('Authentication required: Please login to clap.');
      return;
    }
    try {
      await clapReply(reply.id);
      mutateClaps(); // Refetch clap count
    } catch (error) {
      console.error('Failed to clap:', error);
      alert(error.message || 'Error: Unable to process clap request.');
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
    <div className="bg-terminal-light border border-matrix-green/20 rounded p-3 hover:border-matrix-green/40 transition-all duration-300">
      {/* Reply Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaReply className="w-3 h-3 text-matrix-cyan" />
          <span className="text-xs font-mono text-matrix-green">reply@{reply.id}</span>
        </div>
        <div className="text-xs text-text-muted font-mono">
          <TimeAgo timestamp={reply.created_at} />
        </div>
      </div>

      {/* Author Info with Avatar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-terminal-gray rounded border border-matrix-green/50 flex items-center justify-center flex-shrink-0">
          {reply.user?.avatar ? (
            <img
              src={reply.user.avatar}
              alt={reply.user.name}
              className="w-full h-full rounded object-cover"
            />
          ) : (
            <FaUser className="w-3 h-3 text-matrix-green" />
          )}
        </div>
        <div className="flex items-center gap-1 text-sm font-mono">
          <span className="text-matrix-cyan">@</span>
          <span className="font-medium text-text-primary">
            {reply.user?.name || 'anonymous'}
          </span>
        </div>
      </div>

      {/* Reply Content */}
      <div className="pl-8 mb-2">
        <div className="text-text-secondary font-mono text-sm leading-relaxed">
          <span className="text-text-muted">//</span> {renderContent(reply.content)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pl-8">
        <div className="flex items-center space-x-3">
          {/* Clap Button */}
          <button
            onClick={handleClap}
            className={`flex items-center gap-1 text-sm font-mono transition-all hover:scale-110 ${
              hasClapped ? 'text-hacker-yellow' : 'text-text-muted hover:text-hacker-yellow'
            }`}
            disabled={clapsLoading}
            aria-label="Clap for this reply"
          >
            <FaHandsClapping className={`w-3 h-3 ${clapsLoading ? 'animate-pulse' : ''}`} />
            <span>{clapsCountDisplay(clapsCount, clapsLoading)}</span>
          </button>
        </div>

        <div className="text-xs text-text-muted font-mono">
          Size: {reply.content?.length || 0} chars
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
