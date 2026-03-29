'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const StickyCategoryBar = ({ categories = [] }) => {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-65px 0px 0px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!categories?.length) return null;

  return (
    <div className="lg:hidden -mx-4 md:-mx-6">
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 0 }} />
      <nav
        className="sticky z-30 px-4 md:px-6"
        style={{
          top: 'var(--nav-height)',
          background: isStuck ? 'var(--bg)' : 'transparent',
          backdropFilter: isStuck ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isStuck ? 'blur(16px)' : 'none',
          transition:
            'background 0.4s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.3s',
        }}
      >
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide"
          style={{ padding: '0.65rem 0', WebkitOverflowScrolling: 'touch' }}
        >
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.name.toLowerCase()}`}
              className="flex-shrink-0 hover:bg-[var(--bg-elevated)] hover:text-[var(--accent)]"
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                background: 'var(--bg-surface)',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default StickyCategoryBar;
