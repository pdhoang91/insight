// components/Comment/ReplyItem.js
import React from 'react';
import { FaUser } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapReply } from '../../services/activityService';
import { useUser } from '../../context/UserContext';
import TimeAgo from '../Utils/TimeAgo';

const ReplyItem = ({ reply, commentId, mutate }) => {
  const { user } = useUser();
  const { clapsCount, loading: clapsLoading, hasClapped, mutate: mutateClaps } = useClapsCount('reply', reply.id);

  const handleClap = async () => {
    if (!user) return;
    try {
      await clapReply(reply.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
    }
  };

  return (
    <div className="flex gap-2.5 py-2">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-medium-bg-secondary flex items-center justify-center overflow-hidden">
        {reply.user?.avatar_url ? (
          <img src={reply.user.avatar_url} alt={reply.user.name} className="w-full h-full object-cover" />
        ) : (
          <FaUser className="w-2.5 h-2.5 text-medium-text-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-medium-text-primary">
            {reply.user?.name || 'Anonymous'}
          </span>
          <span className="text-xs text-medium-text-muted">
            <TimeAgo timestamp={reply.created_at} />
          </span>
        </div>

        <div className="text-sm text-medium-text-secondary leading-relaxed mb-1">
          {reply.content}
        </div>

        <button
          onClick={handleClap}
          disabled={clapsLoading}
          className={`flex items-center gap-1 text-xs transition-colors ${
            hasClapped ? 'text-medium-accent-green' : 'text-[#6b6b6b] hover:text-[#242424]'
          }`}
        >
          <FaHandsClapping className={`w-3 h-3 ${clapsLoading ? 'animate-pulse' : ''}`} />
          {clapsCount > 0 && <span>{clapsCount}</span>}
        </button>
      </div>
    </div>
  );
};

export default ReplyItem;
