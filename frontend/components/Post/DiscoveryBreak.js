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
      className="lg:hidden py-8 pb-10 my-2 mb-6"
    >
      {/* Section label — static styles via class, dynamic visibility via inline */}
      <p
        className="ui-section-header mb-[1.2rem]"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {t('sidebar.readingElsewhere')}
      </p>

      {/* Horizontal scroll strip */}
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
            <div className="border-l-2 border-[var(--accent)] pl-3">
              <p className="discovery-title group-hover:text-[var(--accent)]">
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
