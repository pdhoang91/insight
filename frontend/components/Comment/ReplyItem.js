'use client';
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
    try { await clapReply(reply.id); mutateClaps(); } catch (error) { console.error(error); }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '0.625rem',
      paddingBottom: '0.875rem',
      marginBottom: '0.875rem',
      borderBottom: '1px solid var(--border)',
    }}
    className="last:border-0 last:pb-0 last:mb-0"
    >
      <div style={{
        flexShrink: 0,
        width: 24, height: 24, borderRadius: '50%',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        border: '1.5px solid var(--border)',
        marginTop: '0.1rem',
      }}>
        {reply.user?.avatar_url ? (
          <img src={reply.user.avatar_url} alt={reply.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaUser style={{ width: 9, height: 9, color: 'var(--text-faint)' }} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
          }}>
            {reply.user?.name || 'Anonymous'}
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            color: 'var(--text-faint)',
            letterSpacing: '0.01em',
          }}>
            <TimeAgo timestamp={reply.created_at} />
          </span>
        </div>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          color: 'var(--text)',
          marginBottom: '0.5rem',
        }}>
          {reply.content}
        </div>

        <button
          onClick={handleClap}
          disabled={clapsLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '-0.01em',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: hasClapped ? 'var(--accent)' : 'var(--text-faint)',
            transition: 'color 0.2s',
          }}
          className="hover:text-[var(--accent)]"
        >
          <FaHandsClapping style={{ width: 11, height: 11, opacity: clapsLoading ? 0.5 : 1 }} />
          {clapsCount > 0 && <span>{clapsCount}</span>}
        </button>
      </div>
    </div>
  );
};

export default ReplyItem;
