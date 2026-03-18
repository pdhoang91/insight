'use client';
import React from 'react';
import { FaUser } from 'react-icons/fa';
import TimeAgo from '../Utils/TimeAgo';

const ReplyItem = ({ reply, commentId, mutate }) => {

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
        }}>
          {reply.content}
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
