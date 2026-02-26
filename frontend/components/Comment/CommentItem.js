// components/Comment/CommentItem.js
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';
import { useCommentClap } from '../../hooks/useCommentClap';
import { useUser } from '../../context/UserContext';
import { addReply } from '../../services/commentService';
import AddCommentForm from './AddCommentForm';
import CommentContent from './CommentContent';
import ReplyList from './ReplyList';
import TimeAgo from '../Utils/TimeAgo';

const CommentItem = ({ comment, postId, mutate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const t = useTranslations();
  const { user } = useUser();
  const repliesCount = comment.replies?.length || 0;

  const { clapsCount, clapsLoading, hasClapped, handleClap } = useCommentClap(
    comment.id,
    comment.clap_count || 0
  );

  const handleReply = async (content, commentID) => {
    if (!user) {
      alert(t('comment.loginToComment'));
      return;
    }
    if (!content.trim()) return;

    try {
      await addReply(commentID, content);
      mutate();
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert(t('comment.addError'));
    }
  };

  return (
    <li className="list-none border-b border-[#f2f2f2] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center overflow-hidden">
          {comment.user?.avatar_url ? (
            <img src={comment.user.avatar_url} alt={comment.user.name} className="w-full h-full object-cover" />
          ) : (
            <FaUser className="w-3.5 h-3.5 text-[#b3b3b1]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-medium text-[#292929]">
              {comment.user?.name || 'Anonymous'}
            </span>
            <span className="text-[12px] text-[#b3b3b1]">
              <TimeAgo timestamp={comment.created_at} />
            </span>
          </div>

          <div className="text-[14px] text-[#292929] leading-relaxed mb-3">
            <CommentContent content={comment.content} />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleClap}
              className={`flex items-center gap-1.5 text-[13px] transition-colors ${
                hasClapped ? 'text-[#1a8917]' : 'text-[#6b6b6b] hover:text-[#292929]'
              }`}
            >
              <FaHandsClapping className={`w-3.5 h-3.5 ${clapsLoading ? 'animate-pulse' : ''}`} />
              {clapsCount > 0 && <span>{clapsCount}</span>}
            </button>

            <button
              onClick={() => setShowReplyForm(prev => !prev)}
              className="text-[13px] text-[#6b6b6b] hover:text-[#292929] transition-colors"
            >
              {repliesCount > 0 ? `${repliesCount} ${t('comment.reply')}` : t('comment.reply')}
            </button>
          </div>

          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                className="mt-4"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <AddCommentForm
                  onAddComment={(content) => handleReply(content, comment.id)}
                  parentId={comment.id}
                  user={user}
                />

                {comment.replies?.length > 0 && (
                  <div className="mt-4 pl-5 border-l border-[#e6e6e6]">
                    <ReplyList replies={comment.replies} commentId={comment.id} mutate={mutate} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
};

export default CommentItem;
