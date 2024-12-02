// src/components/Comment/ReplyItem.js
import React from 'react';
import Mention from './Mention';
import AuthorInfo from '../Auth/AuthorInfo';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapReply } from '../../services/activityService';
import { useUser } from '../../context/UserContext';
import TimeAgo from '../Utils/TimeAgo';
import { FaHandsClapping } from "react-icons/fa6";

const ReplyItem = ({ reply, commentId, mutate }) => {
  const { user } = useUser();

  const { clapsCount, loading: clapsLoading, hasClapped, mutate: mutateClaps } = useClapsCount('reply', reply.id);

  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }
    try {
      await clapReply(reply.id);
      mutateClaps(); // Refetch clap count
    } catch (error) {
      console.error('Failed to clap:', error);
      alert(error.message || 'Đã xảy ra lỗi khi clap.');
    }
  };

  // Function to highlight mentions
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

  return (
    <li className="p-4 rounded bg-white border border-gray-200 transition hover:shadow-lg">
      {/* Author Info */}
      <AuthorInfo author={reply.user} />

      {/* Reply Content */}
      <p className="text-gray-700 mt-2">{renderContent(reply.content)}</p>

      {/* Timestamp */}
      {/* <p className="text-sm text-gray-500 mt-1">{new Date(reply.created_at).toLocaleString()}</p> */}
      {/* <TimeAgo timestamp={reply.created_at} /> */}

      {/* Actions */}
      <div className="flex items-center mt-2 space-x-4">
        {/* Clap Button */}
        <button
          onClick={handleClap}
          className={`flex items-center text-sm font-medium text-gray-600 hover:text-red-500 transition-colors`}
          disabled={clapsLoading}
          aria-label="Clap for this reply"
        >
          <FaHandsClapping className="mr-1" /> {clapsCountDisplay(clapsCount, clapsLoading)}
        </button>
        <TimeAgo timestamp={reply.created_at} />
      </div>
    </li>
  );
};

// Helper function to display clap count with loading state
const clapsCountDisplay = (count, loading) => {
  if (loading) {
    return '...';
  }
  return count;
};

export default ReplyItem;
