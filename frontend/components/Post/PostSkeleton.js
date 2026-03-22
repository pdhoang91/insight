// components/Post/PostSkeleton.js — Shared skeleton for post list items
const PostSkeleton = () => (
  <div style={{ display: 'flex', gap: '1.25rem', paddingBottom: '2rem', marginBottom: '2rem' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div className="skeleton-warm" style={{ height: '1.1rem', width: '75%', borderRadius: '2px' }} />
      <div className="skeleton-warm" style={{ height: '0.85rem', width: '90%', borderRadius: '2px' }} />
      <div className="skeleton-warm" style={{ height: '0.85rem', width: '55%', borderRadius: '2px' }} />
      <div className="skeleton-warm" style={{ height: '0.72rem', width: '4rem', borderRadius: '2px', marginTop: '0.2rem' }} />
    </div>
  </div>
);

export default PostSkeleton;
