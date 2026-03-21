'use client';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const DiscoveryBreak = ({ posts = [] }) => {
  const t = useTranslations();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!posts?.length) return null;

  return (
    <div
      ref={containerRef}
      className="lg:hidden"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 0 2.5rem',
        margin: '0.5rem 0 1.5rem',
      }}
    >
      {/* Section label — left-aligned, editorial uppercase */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          margin: '0 0 1.2rem 0',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition:
            'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {t('sidebar.readingElsewhere')}
      </p>

      {/* Horizontal scroll strip — editorial accent borders, no cards */}
      <div
        className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 px-4 md:px-6 pb-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {posts.slice(0, 5).map((post, i) => (
          <Link
            key={post.id}
            href={`/p/${post.slug}`}
            className="flex-shrink-0 group"
            style={{
              width: '11rem',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 70}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 70}ms`,
            }}
          >
            <div
              style={{
                borderLeft: '2px solid var(--accent)',
                paddingLeft: '0.75rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  letterSpacing: '-0.01em',
                  color: 'var(--text)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: 0,
                  transition: 'color 0.2s',
                }}
                className="group-hover:text-[var(--accent)]"
              >
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryBreak;
