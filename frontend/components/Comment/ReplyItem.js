'use client';
import React from 'react';
import TimeAgo from '../UI/TimeAgo';
import Avatar from '../UI/Avatar';

const ReplyItem = ({ reply, commentId, mutate }) => {

  return (
    <div style={{
      display: 'flex',
      gap: '0.625rem',
      paddingBottom: '0.875rem',
      marginBottom: '0.875rem',
    }}
    className="last:pb-0 last:mb-0"
    >
      <Avatar
        src={reply.user?.avatar_url}
        name={reply.user?.name}
        size="xs"
        style={{ flexShrink: 0, marginTop: '0.1rem' }}
      />

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
